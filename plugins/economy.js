const { models } = require('../lib/database');
const { random } = require('../lib/utils');

const EconomySchema = new mongoose.Schema({
  jid: { type: String, unique: true },
  balance: { type: Number, default: 0 },
  lastDaily: { type: Date, default: null },
});
const Economy = mongoose.model('Economy', EconomySchema);

module.exports = [
  {
    cmd: 'balance',
    desc: 'Check your coin balance',
    reaction: '💰',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const user = await Economy.findOne({ jid: sender }) || new Economy({ jid: sender });
      await sock.sendMessage(from, { text: `💰 *Balance*\nYou have ${user.balance} coins.` });
    }
  },
  {
    cmd: 'daily',
    desc: 'Collect daily coins',
    reaction: '📅',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      let user = await Economy.findOne({ jid: sender });
      if (!user) user = new Economy({ jid: sender });
      const now = new Date();
      if (user.lastDaily && (now - user.lastDaily) < 24 * 60 * 60 * 1000) {
        const remaining = 24 * 60 * 60 * 1000 - (now - user.lastDaily);
        const hrs = Math.floor(remaining / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        return await sock.sendMessage(from, { text: `⏳ You already claimed daily. Try again in ${hrs}h ${mins}m.` });
      }
      const reward = Math.floor(Math.random() * 500) + 100;
      user.balance += reward;
      user.lastDaily = now;
      await user.save();
      await sock.sendMessage(from, { text: `📅 You received ${reward} coins!` });
    }
  },
  {
    cmd: 'transfer',
    desc: 'Transfer coins to another user',
    reaction: '💸',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const parts = fullArgs.split(' ');
      if (parts.length < 2) return await sock.sendMessage(from, { text: '❌ Usage: .transfer @user amount' });
      const target = parts[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      const amount = parseInt(parts[1]);
      if (isNaN(amount) || amount <= 0) return await sock.sendMessage(from, { text: '❌ Invalid amount.' });
      const senderUser = await Economy.findOne({ jid: sender }) || new Economy({ jid: sender });
      if (senderUser.balance < amount) return await sock.sendMessage(from, { text: '❌ Insufficient balance.' });
      let targetUser = await Economy.findOne({ jid: target }) || new Economy({ jid: target });
      senderUser.balance -= amount;
      targetUser.balance += amount;
      await senderUser.save();
      await targetUser.save();
      await sock.sendMessage(from, { text: `💸 Transferred ${amount} coins to @${target.split('@')[0]}` });
    }
  },
  {
    cmd: 'leaderboard',
    desc: 'Show richest users',
    reaction: '🏆',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const top = await Economy.find().sort({ balance: -1 }).limit(10);
      let text = '🏆 *Coin Leaderboard*\n';
      top.forEach((u, i) => {
        text += `${i+1}. @${u.jid.split('@')[0]} — ${u.balance} coins\n`;
      });
      await sock.sendMessage(from, { text, mentions: top.map(u => u.jid) });
    }
  }
];
