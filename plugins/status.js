const { setSetting, getSetting } = require('../lib/database');

module.exports = [
  {
    cmd: 'statusview',
    desc: 'Auto view status (toggle)',
    reaction: '👁️',
    category: 'status',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const current = await getSetting('autoViewStatus') || false;
      const newVal = !current;
      await setSetting('autoViewStatus', newVal);
      await sock.sendMessage(from, { text: `👁️ Auto view status: ${newVal ? 'ON' : 'OFF'}` });
    }
  },
  {
    cmd: 'statuslike',
    desc: 'Auto like status (toggle)',
    reaction: '❤️',
    category: 'status',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const current = await getSetting('autoLikeStatus') || false;
      const newVal = !current;
      await setSetting('autoLikeStatus', newVal);
      await sock.sendMessage(from, { text: `❤️ Auto like status: ${newVal ? 'ON' : 'OFF'}` });
    }
  },
  {
    cmd: 'statusreply',
    desc: 'Auto reply status (toggle)',
    reaction: '💬',
    category: 'status',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const current = await getSetting('autoReplyStatus') || false;
      const newVal = !current;
      await setSetting('autoReplyStatus', newVal);
      await sock.sendMessage(from, { text: `💬 Auto reply status: ${newVal ? 'ON' : 'OFF'}` });
    }
  },
];
