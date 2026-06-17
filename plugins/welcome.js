const { getSetting, setSetting } = require('../lib/database');

module.exports = [
  {
    cmd: 'setwelcome',
    desc: 'Set welcome message for group (use @user for mention)',
    reaction: '👋',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only.' });
      if (!fullArgs) return await sock.sendMessage(from, { text: '❌ Usage: .setwelcome Welcome message (use @user)' });
      await setSetting(`welcome_${from}`, fullArgs);
      await sock.sendMessage(from, { text: `👋 Welcome message set.` });
    }
  },
  {
    cmd: 'setgoodbye',
    desc: 'Set goodbye message for group (use @user for mention)',
    reaction: '👋',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only.' });
      if (!fullArgs) return await sock.sendMessage(from, { text: '❌ Usage: .setgoodbye Goodbye message (use @user)' });
      await setSetting(`goodbye_${from}`, fullArgs);
      await sock.sendMessage(from, { text: `👋 Goodbye message set.` });
    }
  }
];
