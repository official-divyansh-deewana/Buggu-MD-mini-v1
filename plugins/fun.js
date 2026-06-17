const { random } = require('../lib/utils');

const jokes = [
  'Why do programmers prefer dark mode? Because light attracts bugs!',
  'What do you call a fake noodle? An impasta!',
  'Why did the scarecrow win an award? Because he was outstanding in his field!',
];

const quotes = [
  'The only way to do great work is to love what you do. – Steve Jobs',
  'Innovation distinguishes between a leader and a follower. – Steve Jobs',
  'Stay hungry, stay foolish. – Steve Jobs',
];

const facts = [
  'Octopuses have three hearts.',
  'The Eiffel Tower can be 15 cm taller during the summer.',
  'A day on Venus is longer than a year on Venus.',
];

const truthQuestions = [
  'What is the most embarrassing thing you have ever done?',
  'Have you ever lied to your best friend?',
];

const dareChallenges = [
  'Do 10 push-ups right now.',
  'Send a funny selfie to the group.',
];

module.exports = [
  {
    cmd: 'joke',
    desc: 'Get a joke',
    reaction: '😂',
    category: 'fun',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: `😂 ${random(jokes)}` });
    }
  },
  {
    cmd: 'quote',
    desc: 'Get a quote',
    reaction: '💬',
    category: 'fun',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: `💬 ${random(quotes)}` });
    }
  },
  {
    cmd: 'fact',
    desc: 'Get a random fact',
    reaction: '🧠',
    category: 'fun',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: `🧠 ${random(facts)}` });
    }
  },
  {
    cmd: 'truth',
    desc: 'Truth or dare: truth',
    reaction: '🤫',
    category: 'fun',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: `🤫 ${random(truthQuestions)}` });
    }
  },
  {
    cmd: 'dare',
    desc: 'Truth or dare: dare',
    reaction: '😈',
    category: 'fun',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: `😈 ${random(dareChallenges)}` });
    }
  },
  {
    cmd: 'ship',
    desc: 'Ship two people',
    reaction: '💞',
    category: 'fun',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const names = fullArgs.split(' ').filter(Boolean);
      if (names.length < 2) {
        await sock.sendMessage(from, { text: '❌ Usage: .ship name1 name2' });
        return;
      }
      const name1 = names[0], name2 = names[1];
      const percentage = Math.floor(Math.random() * 100) + 1;
      await sock.sendMessage(from, { text: `💞 ${name1} ❤️ ${name2}\nMatch: ${percentage}%` });
    }
  },
  {
    cmd: 'hack',
    desc: 'Fake hack',
    reaction: '💻',
    category: 'fun',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const target = fullArgs || 'someone';
      await sock.sendMessage(from, { text: `💻 Hacking ${target}...\n🔓 Access granted! (just a joke)` });
    }
  },
  {
    cmd: 'fakechat',
    desc: 'Fake chat',
    reaction: '💬',
    category: 'fun',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const lines = fullArgs.split('|').map(l => l.trim());
      if (lines.length < 2) {
        await sock.sendMessage(from, { text: '❌ Usage: .fakechat person1:msg1|person2:msg2' });
        return;
      }
      let text = '💬 *Fake Chat*\n';
      lines.forEach(line => {
        const [who, ...msgParts] = line.split(':');
        text += `*${who}*: ${msgParts.join(':')}\n`;
      });
      await sock.sendMessage(from, { text });
    }
  },
  {
    cmd: 'wanted',
    desc: 'Wanted poster',
    reaction: '🔫',
    category: 'fun',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const name = fullArgs || 'Unknown';
      await sock.sendMessage(from, { text: `🔫 *WANTED*\n${name}\nReward: $10,000\nDead or Alive` });
    }
  },
];
