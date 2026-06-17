module.exports = [
  {
    cmd: 'admins',
    desc: 'List group admins',
    reaction: '👑',
    category: 'group',
    adminOnly: false,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only.' });
      const metadata = await sock.groupMetadata(from);
      const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
      let text = '👑 *Admins*\n';
      admins.forEach(a => {
        text += `@${a.id.split('@')[0]}\n`;
      });
      await sock.sendMessage(from, { text, mentions: admins.map(a => a.id) });
    }
  }
];
