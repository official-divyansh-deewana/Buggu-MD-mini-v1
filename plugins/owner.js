const config = require('../config');
const { setSetting, getSetting, setUserBanned, getUser } = require('../lib/database');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs-extra');
const path = require('path');

module.exports = [
  {
    cmd: 'setvar',
    desc: 'Set environment variable',
    reaction: '⚙️',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      const [key, ...valueParts] = args;
      const value = valueParts.join(' ');
      if (!key || !value) {
        await sock.sendMessage(from, { text: '❌ Usage: .setvar KEY value' });
        return;
      }
      process.env[key] = value;
      await setSetting(key, value);
      await sock.sendMessage(from, { text: `✅ Set ${key} = ${value}` });
    }
  },
  {
    cmd: 'getvar',
    desc: 'Get environment variable',
    reaction: '⚙️',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      const key = args[0];
      if (!key) {
        await sock.sendMessage(from, { text: '❌ Usage: .getvar KEY' });
        return;
      }
      let value = process.env[key] || await getSetting(key) || 'Not set';
      await sock.sendMessage(from, { text: `🔑 ${key} = ${value}` });
    }
  },
  {
    cmd: 'restart',
    desc: 'Restart bot',
    reaction: '🔄',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      await sock.sendMessage(from, { text: '🔄 Restarting...' });
      process.exit(0);
    }
  },
  {
    cmd: 'shutdown',
    desc: 'Shutdown bot',
    reaction: '⏹️',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      await sock.sendMessage(from, { text: '⏹️ Shutting down...' });
      process.exit(0);
    }
  },
  {
    cmd: 'eval',
    desc: 'Evaluate JavaScript',
    reaction: '💻',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      try {
        const result = eval(fullArgs);
        await sock.sendMessage(from, { text: `✅ Result: ${util.inspect(result, { depth: 2 })}` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'exec',
    desc: 'Execute shell command',
    reaction: '💻',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      try {
        const { stdout, stderr } = await execPromise(fullArgs);
        const output = stdout || stderr || 'No output';
        await sock.sendMessage(from, { text: `📤 Output:\n${output}` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'broadcast',
    desc: 'Broadcast message',
    reaction: '📢',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .broadcast message' });
        return;
      }
      // Get all users from DB (simplified: we could have a list of all jids)
      // For now, just send to owner
      await sock.sendMessage(from, { text: `📢 Broadcast: ${fullArgs}` });
      // In production, you'd iterate over all users and send.
    }
  },
  {
    cmd: 'block',
    desc: 'Block user',
    reaction: '🚫',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      const jid = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      if (!jid) {
        await sock.sendMessage(from, { text: '❌ Usage: .block number' });
        return;
      }
      await sock.updateBlockStatus(jid, 'block');
      await sock.sendMessage(from, { text: `🚫 Blocked ${jid}` });
    }
  },
  {
    cmd: 'unblock',
    desc: 'Unblock user',
    reaction: '✅',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      const jid = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      if (!jid) {
        await sock.sendMessage(from, { text: '❌ Usage: .unblock number' });
        return;
      }
      await sock.updateBlockStatus(jid, 'unblock');
      await sock.sendMessage(from, { text: `✅ Unblocked ${jid}` });
    }
  },
  {
    cmd: 'ban',
    desc: 'Ban user',
    reaction: '🔨',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      const jid = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      if (!jid) {
        await sock.sendMessage(from, { text: '❌ Usage: .ban number' });
        return;
      }
      await setUserBanned(jid, true);
      await sock.sendMessage(from, { text: `🔨 Banned ${jid}` });
    }
  },
  {
    cmd: 'unban',
    desc: 'Unban user',
    reaction: '🔓',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      const jid = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      if (!jid) {
        await sock.sendMessage(from, { text: '❌ Usage: .unban number' });
        return;
      }
      await setUserBanned(jid, false);
      await sock.sendMessage(from, { text: `🔓 Unbanned ${jid}` });
    }
  },
  {
    cmd: 'setprefix',
    desc: 'Change bot prefix',
    reaction: '🔣',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      const newPrefix = args[0];
      if (!newPrefix) {
        await sock.sendMessage(from, { text: '❌ Usage: .setprefix newprefix' });
        return;
      }
      config.prefix = newPrefix;
      await setSetting('prefix', newPrefix);
      await sock.sendMessage(from, { text: `✅ Prefix changed to ${newPrefix}` });
    }
  },
  {
    cmd: 'setmode',
    desc: 'Change bot mode (public/private)',
    reaction: '🌐',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      const mode = args[0]?.toLowerCase();
      if (!['public', 'private'].includes(mode)) {
        await sock.sendMessage(from, { text: '❌ Usage: .setmode public|private' });
        return;
      }
      config.mode = mode;
      await setSetting('mode', mode);
      await sock.sendMessage(from, { text: `✅ Mode set to ${mode}` });
    }
  },
  {
    cmd: 'setpp',
    desc: 'Set profile picture',
    reaction: '🖼️',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      // Expecting image message or URL
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      let imageUrl = args[0];
      if (quoted && quoted.imageMessage) {
        // Download image from quoted
        const media = await sock.downloadMediaMessage(msg);
        // Use media to set pp
        await sock.updateProfilePicture(from, media);
        await sock.sendMessage(from, { text: '✅ Profile picture updated!' });
      } else if (imageUrl) {
        // Download from URL and set
        const buffer = await require('axios').get(imageUrl, { responseType: 'arraybuffer' });
        await sock.updateProfilePicture(from, buffer.data);
        await sock.sendMessage(from, { text: '✅ Profile picture updated from URL!' });
      } else {
        await sock.sendMessage(from, { text: '❌ Please reply to an image or provide URL.' });
      }
    }
  },
  {
    cmd: 'setname',
    desc: 'Set bot name',
    reaction: '✏️',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .setname New Name' });
        return;
      }
      await sock.updateProfileName(fullArgs);
      await sock.sendMessage(from, { text: `✅ Name set to ${fullArgs}` });
    }
  },
  {
    cmd: 'setbio',
    desc: 'Set bot about',
    reaction: '📝',
    category: 'owner',
    ownerOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner) => {
      if (!isOwner) return;
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .setbio New Bio' });
        return;
      }
      await sock.updateProfileStatus(fullArgs);
      await sock.sendMessage(from, { text: `✅ Bio set to ${fullArgs}` });
    }
  },
];
