const config = require('../config');
const { setSetting, getSetting } = require('../lib/database');

module.exports = [
  {
    cmd: 'pair',
    desc: 'Generate pair code',
    reaction: '🔑',
    category: 'special',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      // This command generates a pairing code for a new device.
      // Usage: .pair 91xxxxxxxxxx
      const phone = args[0]?.replace(/[^0-9]/g, '');
      if (!phone) {
        await sock.sendMessage(from, { text: '❌ Usage: .pair phone_number' });
        return;
      }
      const jid = phone + '@s.whatsapp.net';
      try {
        const code = await sock.requestPairingCode(phone);
        await sock.sendMessage(from, { text: `🔑 Pairing code for ${phone}: *${code}*\nUse this code to link your device.` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'setty',
    desc: 'Advanced settings menu',
    reaction: '⚙️',
    category: 'special',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      // Fetch current settings
      const autoRead = await getSetting('autoRead') || false;
      const autoViewStatus = await getSetting('autoViewStatus') || false;
      const autoLikeStatus = await getSetting('autoLikeStatus') || false;
      const autoReplyStatus = await getSetting('autoReplyStatus') || false;
      const antiCall = await getSetting('antiCall') || false;
      const autoReact = await getSetting('autoReact') || false;
      const welcome = await getSetting('welcome') || false;
      const goodbye = await getSetting('goodbye') || false;
      const mode = config.mode;
      const antiDelete = await getSetting('antiDelete') || false;

      const text = `⚙️ *Advanced Settings*\n\n` +
        `1. Auto Read: ${autoRead ? '✅' : '❌'}\n` +
        `2. Auto View Status: ${autoViewStatus ? '✅' : '❌'}\n` +
        `3. Auto Like Status: ${autoLikeStatus ? '✅' : '❌'}\n` +
        `4. Auto Reply Status: ${autoReplyStatus ? '✅' : '❌'}\n` +
        `5. Anti Call: ${antiCall ? '✅' : '❌'}\n` +
        `6. Auto React: ${autoReact ? '✅' : '❌'}\n` +
        `7. Welcome: ${welcome ? '✅' : '❌'}\n` +
        `8. Goodbye: ${goodbye ? '✅' : '❌'}\n` +
        `9. Anti Delete: ${antiDelete ? '✅' : '❌'}\n` +
        `10. Mode: ${mode}\n\n` +
        `To toggle, send: .setty <number> (e.g., .setty 1)`;
      await sock.sendMessage(from, { text });
    }
  },
  // Allow toggling settings via .setty <number>
  // This is a simple implementation; we'll handle it in the main message handler for .setty?
  // We'll implement as a separate command but can be extended.
  // For simplicity, we'll add a subcommand handler in the execute above.
  // Actually we can handle args: if args[0] is a number, toggle that setting.
  // We'll modify the above to handle toggling.
  // But for this file, we'll keep the menu and handle toggling in the execute.
  // Let's re-define .setty to accept number to toggle.
  // We'll add a second command or modify above.
  // Since we can't have two commands with same name, we'll combine.
  // Let's rewrite .setty to handle both menu and toggling.
  // But we already defined it, we can override.
];

// We'll replace the .setty command with a more complete one.
// I'll remove the previous and add a new one that handles toggling.
// For this file, we'll export an array with .pair and .boom, and .setty handled separately.
// To avoid conflict, we'll put .setty in this file as well with full logic.

// Actually let's just add .boom and .setty here with proper implementations.
// We'll remove the previous .setty and add new.

// Let's rewrite the entire file with correct commands.

module.exports = [
  {
    cmd: 'pair',
    desc: 'Generate pair code',
    reaction: '🔑',
    category: 'special',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const phone = args[0]?.replace(/[^0-9]/g, '');
      if (!phone) {
        await sock.sendMessage(from, { text: '❌ Usage: .pair phone_number' });
        return;
      }
      try {
        const code = await sock.requestPairingCode(phone);
        await sock.sendMessage(from, { text: `🔑 Pairing code for ${phone}: *${code}*` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'setty',
    desc: 'Advanced settings menu',
    reaction: '⚙️',
    category: 'special',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const number = parseInt(args[0]);
      if (!isNaN(number) && number >= 1 && number <= 10) {
        // Toggle setting
        const settings = [
          'autoRead',
          'autoViewStatus',
          'autoLikeStatus',
          'autoReplyStatus',
          'antiCall',
          'autoReact',
          'welcome',
          'goodbye',
          'antiDelete',
          'mode'
        ];
        const key = settings[number - 1];
        if (key === 'mode') {
          const newMode = config.mode === 'public' ? 'private' : 'public';
          config.mode = newMode;
          await setSetting('mode', newMode);
          await sock.sendMessage(from, { text: `🌐 Mode toggled to ${newMode}` });
        } else {
          const current = await getSetting(key) || false;
          const newVal = !current;
          await setSetting(key, newVal);
          await sock.sendMessage(from, { text: `⚙️ ${key} toggled to ${newVal}` });
        }
        return;
      }
      // Show menu
      const autoRead = await getSetting('autoRead') || false;
      const autoViewStatus = await getSetting('autoViewStatus') || false;
      const autoLikeStatus = await getSetting('autoLikeStatus') || false;
      const autoReplyStatus = await getSetting('autoReplyStatus') || false;
      const antiCall = await getSetting('antiCall') || false;
      const autoReact = await getSetting('autoReact') || false;
      const welcome = await getSetting('welcome') || false;
      const goodbye = await getSetting('goodbye') || false;
      const antiDelete = await getSetting('antiDelete') || false;
      const mode = config.mode;

      const text = `⚙️ *Advanced Settings*\n\n` +
        `1. Auto Read: ${autoRead ? '✅' : '❌'}\n` +
        `2. Auto View Status: ${autoViewStatus ? '✅' : '❌'}\n` +
        `3. Auto Like Status: ${autoLikeStatus ? '✅' : '❌'}\n` +
        `4. Auto Reply Status: ${autoReplyStatus ? '✅' : '❌'}\n` +
        `5. Anti Call: ${antiCall ? '✅' : '❌'}\n` +
        `6. Auto React: ${autoReact ? '✅' : '❌'}\n` +
        `7. Welcome: ${welcome ? '✅' : '❌'}\n` +
        `8. Goodbye: ${goodbye ? '✅' : '❌'}\n` +
        `9. Anti Delete: ${antiDelete ? '✅' : '❌'}\n` +
        `10. Mode: ${mode}\n\n` +
        `To toggle, send: .setty <number> (e.g., .setty 1)`;
      await sock.sendMessage(from, { text });
    }
  },
  {
    cmd: 'boom',
    desc: 'Boom command (repeat text)',
    reaction: '💥',
    category: 'special',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .boom text [count]' });
        return;
      }
      const parts = fullArgs.split(' ');
      let text = parts.join(' ');
      let count = 7; // default
      // Check if last part is a number
      const last = parts[parts.length - 1];
      if (!isNaN(last) && parseInt(last) > 0) {
        count = parseInt(last);
        text = parts.slice(0, -1).join(' ');
      }
      if (!text) {
        await sock.sendMessage(from, { text: '❌ Provide text to boom.' });
        return;
      }
      let result = '';
      for (let i = 0; i < count; i++) {
        result += text + '\n';
      }
      await sock.sendMessage(from, { text: result.trim() });
    }
  },
];
