const { getSetting, setSetting } = require('../lib/database');

module.exports = [
  {
    cmd: 'antispam',
    desc: 'Toggle anti-spam (warn/kick after repeated messages)',
    reaction: '🚫',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only.' });
      const current = await getSetting(`antispam_${from}`) || false;
      const newVal = !current;
      await setSetting(`antispam_${from}`, newVal);
      await sock.sendMessage(from, { text: `🚫 Anti-spam is now ${newVal ? 'ON' : 'OFF'}` });
    }
  }
];
