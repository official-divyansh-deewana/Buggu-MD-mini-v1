// ─────────────────────────────────────────────────────────────
// BUGGU‑MD — WhatsApp Bot (Stable)
// ─────────────────────────────────────────────────────────────

const { makeWASocket, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { MongoStore } = require('./lib/sessionStore');
const database = require('./lib/database');
const pluginHandler = require('./lib/pluginHandler');
const { generateMenu } = require('./lib/menu');
const config = require('./config');
const express = require('express');
const path = require('path');
const moment = require('moment');
require('dotenv').config();

// ─── Express Server ──────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/pair', require('./pair/index'));

app.get('/health', (req, res) => res.send('OK'));
app.get('/keep-alive', (req, res) => res.send('Alive'));

const server = app.listen(config.pairPort || 3000, () => {
  console.log(`🟢 Server running on port ${config.pairPort || 3000}`);
});

// ─── Global Error Handlers ──────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  if (sock) sock.end();
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// ─── MongoDB Connection ────────────────────────────────────
(async () => {
  try {
    await database.connect();
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
})();

// ─── Bot State ──────────────────────────────────────────────
let sock = null;
let isConnecting = false;
let currentSock = null;

// ─── Spam & Cooldown ──────────────────────────────────────
const spamTracker = new Map();
const cooldowns = new Map();

// ─── Constants ──────────────────────────────────────────────
const XP_PER_MSG = 10;
const LEVEL_UP_BASE = 100;
const { models, getSetting, setSetting, updateStats } = database;
const { Level } = models;

// ─── Helper: Check Group Admin ─────────────────────────────
async function isUserAdmin(sock, groupJid, userJid) {
  try {
    const metadata = await sock.groupMetadata(groupJid);
    const participant = metadata.participants.find(p => p.id === userJid);
    return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
  } catch {
    return false;
  }
}

// ─── Start Bot ─────────────────────────────────────────────
async function startBot() {
  if (isConnecting) return;
  isConnecting = true;

  try {
    const { version } = await fetchLatestBaileysVersion();
    console.log(`📡 Baileys version: ${version}`);

    const store = new MongoStore(config.sessionName);
    await store.initialize();
    const { state, saveCreds } = await store.getState();

    sock = makeWASocket({
      version,
      auth: { state, saveCreds },
      printQRInTerminal: true,
      browser: ['BUGGU-MD', 'Chrome', '120.0.0.0'],
      keepAliveIntervalMs: 60000,
    });
    currentSock = sock;

    sock.ev.on('creds.update', saveCreds);

    // ─── Connection Update ──────────────────────────────────
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        console.log('📱 Scan QR to connect (or use pair code)');
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = (statusCode !== DisconnectReason.loggedOut);
        console.log(`🔌 Connection closed (${statusCode}), reconnecting: ${shouldReconnect}`);
        if (shouldReconnect) {
          currentSock = null;
          isConnecting = false;
          setTimeout(startBot, 5000);
        } else {
          currentSock = null;
          console.log('❌ Logged out, stopping bot.');
          process.exit(0);
        }
      } else if (connection === 'open') {
        console.log('✅ BUGGU-MD is online!');
        isConnecting = false;
        await pluginHandler.loadAll(sock);
        await generateMenu(sock);
        const ownerJid = config.ownerNumber + '@s.whatsapp.net';
        await sock.sendMessage(ownerJid, { text: `🤖 *BUGGU-MD* is online!\n📅 ${moment().format('LLLL')}` });
      }
    });

    // ─── Group Participant Events ──────────────────────────
    sock.ev.on('group-participants.update', async (update) => {
      const { id, participants, action } = update;
      for (const user of participants) {
        if (action === 'add') {
          const welcomeMsg = await getSetting(`welcome_${id}`) || 'Welcome @user to the group!';
          const text = welcomeMsg.replace(/@user/g, `@${user.split('@')[0]}`);
          await sock.sendMessage(id, { text, mentions: [user] });
        } else if (action === 'remove') {
          const goodbyeMsg = await getSetting(`goodbye_${id}`) || 'Goodbye @user!';
          const text = goodbyeMsg.replace(/@user/g, `@${user.split('@')[0]}`);
          await sock.sendMessage(id, { text, mentions: [user] });
        }
      }
    });

    // ─── Message Handling ───────────────────────────────────
    sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.message) return;
      if (msg.key.fromMe) return;

      const sender = msg.key.remoteJid;
      const isGroup = sender.endsWith('@g.us');
      const from = sender;
      const senderJid = msg.key.participant || sender;

      let text = '';
      if (msg.message.conversation) text = msg.message.conversation;
      else if (msg.message.extendedTextMessage) text = msg.message.extendedTextMessage.text;
      else if (msg.message.imageMessage) text = msg.message.imageMessage.caption || '';
      else return;

      // ─── Anti-Link ──────────────────────────────────────────
      if (isGroup) {
        const antilinkEnabled = await getSetting(`antilink_${from}`) || false;
        if (antilinkEnabled) {
          const linkRegex = /(https?:\/\/|www\.|bit\.ly|tinyurl|shorturl)/i;
          if (linkRegex.test(text)) {
            await sock.sendMessage(from, { delete: msg.key });
            await sock.sendMessage(from, { text: '🔗 Links are not allowed here.' });
            return;
          }
        }
      }

      // ─── Anti-Spam ───────────────────────────────────────────
      if (isGroup) {
        const spamKey = `${from}_${senderJid}`;
        const now = Date.now();
        if (!spamTracker.has(spamKey)) {
          spamTracker.set(spamKey, { count: 1, first: now });
        } else {
          const data = spamTracker.get(spamKey);
          if (now - data.first < 5000) {
            data.count++;
            if (data.count > 5) {
              const antispamEnabled = await getSetting(`antispam_${from}`) || false;
              if (antispamEnabled) {
                await sock.sendMessage(from, { text: `⚠️ @${senderJid.split('@')[0]} is spamming!`, mentions: [senderJid] });
              }
              data.count = 0;
            }
          } else {
            data.count = 1;
            data.first = now;
          }
        }
      }

      // ─── Mute Check ──────────────────────────────────────────
      if (isGroup) {
        const isMuted = await getSetting(`mute_${from}_${senderJid}`) || false;
        if (isMuted) {
          const isOwner = senderJid === config.ownerNumber + '@s.whatsapp.net';
          if (!isOwner) {
            await sock.sendMessage(from, { delete: msg.key });
            await sock.sendMessage(from, { text: `🔇 You are muted in this group.` });
            return;
          }
        }
      }

      const prefix = config.prefix;
      const isCommand = text.startsWith(prefix);

      // ─── XP System ─────────────────────────────────────────────
      if (!isCommand) {
        let levelUser = await Level.findOne({ jid: senderJid });
        if (!levelUser) levelUser = new Level({ jid: senderJid });
        levelUser.xp += XP_PER_MSG;
        levelUser.messages += 1;
        const nextLevelXP = LEVEL_UP_BASE + levelUser.level * 50;
        if (levelUser.xp >= nextLevelXP) {
          levelUser.level += 1;
          levelUser.xp -= nextLevelXP;
          await sock.sendMessage(from, { text: `🎉 @${senderJid.split('@')[0]} leveled up to level ${levelUser.level}!`, mentions: [senderJid] });
        }
        await levelUser.save();
        return;
      }

      // ─── Command Parsing ──────────────────────────────────
      const args = text.slice(prefix.length).trim().split(/\s+/);
      const command = args.shift().toLowerCase();
      const fullArgs = args.join(' ');

      const plugin = pluginHandler.getCommand(command);
      if (!plugin) return;

      const isOwner = senderJid === config.ownerNumber + '@s.whatsapp.net';
      const isGroupAdmin = isGroup ? await isUserAdmin(sock, from, senderJid) : false;

      if (config.mode === 'private' && !isOwner) {
        await sock.sendMessage(from, { text: '🔒 Bot is in private mode. Only owner can use commands.' });
        return;
      }
      if (plugin.ownerOnly && !isOwner) {
        await sock.sendMessage(from, { text: '⛔ This command is only for the bot owner.' });
        return;
      }
      if (plugin.adminOnly && !isGroupAdmin && !isOwner) {
        await sock.sendMessage(from, { text: '⛔ You need to be a group admin to use this command.' });
        return;
      }

      const cooldownKey = `${command}_${senderJid}`;
      if (plugin.cooldown && plugin.cooldown > 0) {
        const last = cooldowns.get(cooldownKey);
        if (last && (Date.now() - last) < plugin.cooldown * 1000) {
          await sock.sendMessage(from, { text: `⏳ Please wait ${plugin.cooldown} seconds between commands.` });
          return;
        }
        cooldowns.set(cooldownKey, Date.now());
      }

      if (plugin.reaction) {
        await sock.sendMessage(from, { react: { text: plugin.reaction, key: msg.key } }).catch(() => {});
      }

      try {
        await plugin.execute(sock, msg, from, senderJid, args, fullArgs, isOwner, isGroupAdmin);
        await updateStats(command);
      } catch (err) {
        console.error(`Error executing ${command}:`, err);
        await sock.sendMessage(from, { text: `❌ Error: ${err.message || 'Unknown error'}` });
      }
    });

  } catch (err) {
    console.error('❌ Failed to start bot:', err);
    isConnecting = false;
    setTimeout(startBot, 10000);
  }
}

// ─── Start ──────────────────────────────────────────────────
startBot();

// ─── Export socket getter for pair route ───────────────────
function getSock() {
  return currentSock;
}

// ─── Anti‑Sleep / Keep‑Alive ──────────────────────────────
setInterval(() => {
  if (sock) {
    sock.sendPresenceUpdate('available').catch(() => {});
  }
}, 30000);

// ─── Auto‑Restart on Memory High ──────────────────────────
setInterval(() => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  if (used > 500) {
    console.warn(`⚠️ Memory usage high (${used} MB). Restarting...`);
    process.exit(0);
  }
}, 60000);

module.exports = { startBot, getSock };
