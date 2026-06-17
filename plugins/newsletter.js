const config = require('../config');

module.exports = [
  {
    cmd: 'newsletter',
    desc: 'Newsletter info',
    reaction: '📰',
    category: 'newsletter',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const text = `📰 *BUGGU-MD Newsletter*\n📢 Channel: ${config.channelLink}\n📱 JID: ${config.channelJid}\n🔔 Stay updated!`;
      await sock.sendMessage(from, { text });
    }
  },
  {
    cmd: 'channel',
    desc: 'Channel info',
    reaction: '📺',
    category: 'newsletter',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const text = `📺 *BUGGU-MD Channel*\n🔗 ${config.channelLink}\n📱 JID: ${config.channelJid}\n👥 Join for updates!`;
      await sock.sendMessage(from, { text });
    }
  },
];
