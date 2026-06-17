const { getGroup, updateGroup } = require('../lib/database');

module.exports = [
  {
    cmd: 'tagall',
    desc: 'Tag all group members',
    reaction: '🏷️',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants;
      let mentions = participants.map(p => p.id);
      let text = `📢 *Tag All*\n`;
      text += participants.map(p => `@${p.split('@')[0]}`).join(' ');
      await sock.sendMessage(from, { text, mentions });
    }
  },
  {
    cmd: 'hidetag',
    desc: 'Tag all without mention',
    reaction: '🙈',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants.map(p => p.id);
      let text = fullArgs || '🔊 Message to all (hidden tags)';
      await sock.sendMessage(from, { text, mentions: participants });
    }
  },
  {
    cmd: 'kick',
    desc: 'Kick a member',
    reaction: '👢',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      const jid = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      if (!jid) {
        await sock.sendMessage(from, { text: '❌ Usage: .kick @user' });
        return;
      }
      await sock.groupParticipantsUpdate(from, [jid], 'remove');
      await sock.sendMessage(from, { text: `👢 Removed ${jid}` });
    }
  },
  {
    cmd: 'add',
    desc: 'Add a member',
    reaction: '➕',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      const jid = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      if (!jid) {
        await sock.sendMessage(from, { text: '❌ Usage: .add number' });
        return;
      }
      await sock.groupParticipantsUpdate(from, [jid], 'add');
      await sock.sendMessage(from, { text: `➕ Added ${jid}` });
    }
  },
  {
    cmd: 'promote',
    desc: 'Promote to admin',
    reaction: '⬆️',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      const jid = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      if (!jid) {
        await sock.sendMessage(from, { text: '❌ Usage: .promote @user' });
        return;
      }
      await sock.groupParticipantsUpdate(from, [jid], 'promote');
      await sock.sendMessage(from, { text: `⬆️ Promoted ${jid}` });
    }
  },
  {
    cmd: 'demote',
    desc: 'Demote admin',
    reaction: '⬇️',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      const jid = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      if (!jid) {
        await sock.sendMessage(from, { text: '❌ Usage: .demote @user' });
        return;
      }
      await sock.groupParticipantsUpdate(from, [jid], 'demote');
      await sock.sendMessage(from, { text: `⬇️ Demoted ${jid}` });
    }
  },
  {
    cmd: 'group open',
    desc: 'Open group (allow all)',
    reaction: '🔓',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      await sock.groupSettingUpdate(from, 'open');
      await sock.sendMessage(from, { text: '🔓 Group opened for all.' });
    }
  },
  {
    cmd: 'group close',
    desc: 'Close group (only admins)',
    reaction: '🔒',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      await sock.groupSettingUpdate(from, 'close');
      await sock.sendMessage(from, { text: '🔒 Group closed (admins only).' });
    }
  },
  {
    cmd: 'group settings',
    desc: 'View group settings',
    reaction: '⚙️',
    category: 'group',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      const metadata = await sock.groupMetadata(from);
      const text = `📊 *Group Settings*\nName: ${metadata.subject}\nOwner: ${metadata.owner}\nMembers: ${metadata.participants.length}\nRestricted: ${metadata.restrict ? 'Yes' : 'No'}\nAnnounce: ${metadata.announce ? 'Yes' : 'No'}`;
      await sock.sendMessage(from, { text });
    }
  },
  {
    cmd: 'invite',
    desc: 'Get group invite link',
    reaction: '🔗',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      const code = await sock.groupInviteCode(from);
      const link = `https://chat.whatsapp.com/${code}`;
      await sock.sendMessage(from, { text: `🔗 Invite link: ${link}` });
    }
  },
  {
    cmd: 'revoke',
    desc: 'Revoke invite link',
    reaction: '🚫',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      await sock.groupRevokeInvite(from);
      await sock.sendMessage(from, { text: '🚫 Invite link revoked.' });
    }
  },
  {
    cmd: 'delete',
    desc: 'Delete a message',
    reaction: '🗑️',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      // Delete the replied message
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) {
        await sock.sendMessage(from, { text: '❌ Reply to a message to delete.' });
        return;
      }
      const key = msg.message.extendedTextMessage.contextInfo.stanzaId;
      await sock.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: key, participant: sender } });
      await sock.sendMessage(from, { text: '🗑️ Message deleted.' });
    }
  },
  {
    cmd: 'mute',
    desc: 'Mute group',
    reaction: '🔇',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      // Set group to announce only
      await sock.groupSettingUpdate(from, 'announcement');
      await sock.sendMessage(from, { text: '🔇 Group muted (announcement only).' });
    }
  },
  {
    cmd: 'unmute',
    desc: 'Unmute group',
    reaction: '🔊',
    category: 'group',
    adminOnly: true,
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ This command only works in groups.' });
        return;
      }
      await sock.groupSettingUpdate(from, 'not_announcement');
      await sock.sendMessage(from, { text: '🔊 Group unmuted.' });
    }
  },
];
