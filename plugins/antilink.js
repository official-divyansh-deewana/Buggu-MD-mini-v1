const { getSetting, setSetting } = require('../lib/database');

module.exports = [
  {
    cmd: 'antilink',
    desc: 'Toggle anti-link protection (auto-delete links)',
    reaction: '🔗',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only.' });
      const current = await getSetting(`antilink_${from}`) || false;
      const newVal = !current;
      await setSetting(`antilink_${from}`, newVal);
      await sock.sendMessage(from, { text: `🔗 Anti-link is now ${newVal ? 'ON' : 'OFF'}` });
    }
  }
];
