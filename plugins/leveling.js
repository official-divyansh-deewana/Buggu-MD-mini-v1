const { models } = require('../lib/database');
const mongoose = require('mongoose');

const LevelSchema = new mongoose.Schema({
  jid: { type: String, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  messages: { type: Number, default: 0 },
});
const Level = mongoose.model('Level', LevelSchema);

// XP per message (configurable)
const XP_PER_MSG = 10;
const LEVEL_UP_BASE = 100;

module.exports = [
  {
    cmd: 'rank',
    desc: 'Check your rank and XP',
    reaction: '📊',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      let user = await Level.findOne({ jid: sender });
      if (!user) user = new Level({ jid: sender });
      const nextLevelXP = LEVEL_UP_BASE + user.level * 50;
      const progress = Math.min(100, (user.xp / nextLevelXP) * 100);
      await sock.sendMessage(from, { text: `📊 *Rank*\nLevel: ${user.level}\nXP: ${user.xp} / ${nextLevelXP}\nMessages: ${user.messages}\nProgress: ${progress.toFixed(1)}%` });
    }
  },
  {
    cmd: 'leaderboard level',
    desc: 'Show top leveled users',
    reaction: '🏅',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const top = await Level.find().sort({ level: -1, xp: -1 }).limit(10);
      let text = '🏅 *Level Leaderboard*\n';
      top.forEach((u, i) => {
        text += `${i+1}. @${u.jid.split('@')[0]} — Level ${u.level} (${u.xp} XP)\n`;
      });
      await sock.sendMessage(from, { text, mentions: top.map(u => u.jid) });
    }
  }
];
