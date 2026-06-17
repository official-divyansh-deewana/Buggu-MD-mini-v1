const config = require('../config');
const { formatMenu } = require('../lib/menu');
const { formatTime } = require('../lib/utils');
const { getStats } = require('../lib/database');
const os = require('os');
const moment = require('moment');

module.exports = [
  {
    cmd: 'menu',
    desc: 'Show main menu',
    reaction: '📋',
    category: 'general',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const menuText = formatMenu(sock);
      await sock.sendMessage(from, { text: menuText });
    }
  },
  {
    cmd: 'help',
    desc: 'Alias for menu',
    reaction: '📋',
    category: 'general',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const menuText = formatMenu(sock);
      await sock.sendMessage(from, { text: menuText });
    }
  },
  {
    cmd: 'ping',
    desc: 'Check bot latency',
    reaction: '🏓',
    category: 'general',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const start = Date.now();
      await sock.sendMessage(from, { text: '🏓 Pinging...' });
      const end = Date.now();
      await sock.sendMessage(from, { text: `🏓 Pong! ${end - start}ms` });
    }
  },
  {
    cmd: 'alive',
    desc: 'Check if bot is alive',
    reaction: '💚',
    category: 'general',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: `🤖 *${config.botName}* is alive and well! 💚` });
    }
  },
  {
    cmd: 'runtime',
    desc: 'Bot uptime',
    reaction: '⏱️',
    category: 'general',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const uptime = process.uptime();
      await sock.sendMessage(from, { text: `⏱️ Uptime: ${formatTime(uptime)}` });
    }
  },
  {
    cmd: 'owner',
    desc: 'Owner info',
    reaction: '👑',
    category: 'general',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const text = `👑 *Owner:* ${config.ownerName}\n📞 *Number:* ${config.ownerNumber}\n📱 *Bot:* ${config.botName}`;
      await sock.sendMessage(from, { text });
    }
  },
  {
    cmd: 'repo',
    desc: 'Bot repository',
    reaction: '📁',
    category: 'general',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: '📁 *Repository:* https://github.com/yourusername/BUGGU-MD' });
    }
  },
  {
    cmd: 'script',
    desc: 'Bot script info',
    reaction: '📜',
    category: 'general',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const pkg = require('../package.json');
      await sock.sendMessage(from, { text: `📜 *Script:* ${pkg.name} v${pkg.version}\n📝 *Description:* ${pkg.description}` });
    }
  },
  {
    cmd: 'info',
    desc: 'Bot information',
    reaction: 'ℹ️',
    category: 'general',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const stats = await getStats();
      const text = `🤖 *${config.botName}*\n👑 Owner: ${config.ownerName}\n📌 Prefix: ${config.prefix}\n🌐 Mode: ${config.mode}\n📊 Commands used: ${stats.commands}\n⏱️ Uptime: ${formatTime(process.uptime())}`;
      await sock.sendMessage(from, { text });
    }
  },
  {
    cmd: 'system',
    desc: 'System status',
    reaction: '🖥️',
    category: 'general',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const mem = process.memoryUsage();
      const totalMem = os.totalmem() / 1024 / 1024;
      const freeMem = os.freemem() / 1024 / 1024;
      const text = `🖥️ *System Info*\nCPU: ${os.cpus().length} cores\nRAM: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB used / ${totalMem.toFixed(2)} MB total\nFree: ${freeMem.toFixed(2)} MB\nPlatform: ${os.platform()}`;
      await sock.sendMessage(from, { text });
    }
  },
  {
    cmd: 'rules',
    desc: 'Bot rules',
    reaction: '📖',
    category: 'general',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const text = `📖 *BUGGU-MD Rules*\n1. Respect all users.\n2. No spam or abuse.\n3. Use commands responsibly.\n4. Bot is for fun and utility.\n5. Owner has final say.\n\n🔗 Group: ${config.groupLink}`;
      await sock.sendMessage(from, { text });
    }
  },
];
