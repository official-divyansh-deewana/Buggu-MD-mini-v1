const { models } = require('../lib/database');
const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  groupJid: String,
  creator: String,
  question: String,
  options: [String],
  votes: [{
    voter: String,
    option: Number
  }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
const Poll = mongoose.model('Poll', PollSchema);

module.exports = [
  {
    cmd: 'poll',
    desc: 'Create a poll: .poll "Question" "Option1" "Option2" ...',
    reaction: '📊',
    category: 'group',
    adminOnly: false,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only.' });
      const parts = fullArgs.match(/"([^"]*)"/g)?.map(s => s.slice(1, -1));
      if (!parts || parts.length < 3) {
        return await sock.sendMessage(from, { text: '❌ Usage: .poll "Question" "Option1" "Option2" ...' });
      }
      const question = parts[0];
      const options = parts.slice(1);
      if (options.length < 2) return await sock.sendMessage(from, { text: '❌ At least 2 options required.' });
      const poll = new Poll({ groupJid: from, creator: sender, question, options });
      await poll.save();
      let text = `📊 *POLL*\n*${question}*\n\n`;
      options.forEach((opt, i) => {
        text += `${i+1}. ${opt}\n`;
      });
      text += `\nReply with .vote <number> to vote.`;
      await sock.sendMessage(from, { text });
    }
  },
  {
    cmd: 'vote',
    desc: 'Vote on a poll: .vote 1',
    reaction: '✅',
    category: 'group',
    adminOnly: false,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only.' });
      const optionNum = parseInt(args[0]);
      if (isNaN(optionNum) || optionNum < 1) return await sock.sendMessage(from, { text: '❌ Provide option number.' });
      const poll = await Poll.findOne({ groupJid: from, active: true }).sort({ createdAt: -1 });
      if (!poll) return await sock.sendMessage(from, { text: '❌ No active poll in this group.' });
      if (optionNum > poll.options.length) return await sock.sendMessage(from, { text: '❌ Invalid option.' });
      // Check if user already voted
      const existing = poll.votes.find(v => v.voter === sender);
      if (existing) return await sock.sendMessage(from, { text: '❌ You already voted.' });
      poll.votes.push({ voter: sender, option: optionNum - 1 });
      await poll.save();
      await sock.sendMessage(from, { text: `✅ Voted for option ${optionNum}.` });
    }
  },
  {
    cmd: 'pollresults',
    desc: 'Show poll results',
    reaction: '📈',
    category: 'group',
    adminOnly: false,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only.' });
      const poll = await Poll.findOne({ groupJid: from, active: true }).sort({ createdAt: -1 });
      if (!poll) return await sock.sendMessage(from, { text: '❌ No active poll.' });
      let text = `📈 *Poll Results*\n${poll.question}\n\n`;
      const counts = poll.options.map((_, i) => poll.votes.filter(v => v.option === i).length);
      const total = poll.votes.length;
      poll.options.forEach((opt, i) => {
        const pct = total ? Math.round((counts[i] / total) * 100) : 0;
        text += `${i+1}. ${opt} — ${counts[i]} votes (${pct}%)\n`;
      });
      await sock.sendMessage(from, { text });
    }
  }
];
