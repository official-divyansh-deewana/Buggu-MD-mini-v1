const { getSetting, setSetting } = require('../lib/database');
const { random } = require('../lib/utils');

// NSFW images (simulated; you'd use an API)
const nsfwImages = [
  'https://example.com/nsfw1.jpg',
  // ...
];

module.exports = [
  {
    cmd: 'nsfw',
    desc: 'Toggle NSFW mode (group only)',
    reaction: '🔞',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only.' });
      const current = await getSetting(`nsfw_${from}`) || false;
      const newVal = !current;
      await setSetting(`nsfw_${from}`, newVal);
      await sock.sendMessage(from, { text: `🔞 NSFW is now ${newVal ? 'ON' : 'OFF'}` });
    }
  },
  {
    cmd: 'nsfwimage',
    desc: 'Get a random NSFW image (if enabled)',
    reaction: '🔞',
    category: 'nsfw',
    adminOnly: false,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (from.endsWith('@g.us')) {
        const nsfw = await getSetting(`nsfw_${from}`) || false;
        if (!nsfw) return await sock.sendMessage(from, { text: '🔞 NSFW is disabled in this group.' });
      }
      const img = random(nsfwImages);
      await sock.sendMessage(from, { image: { url: img }, caption: '🔞 NSFW' });
    }
  }
];
