const fs = require('fs-extra');
const path = require('path');
const { getAllCommands, getCategories } = require('./pluginHandler');
const config = require('../config');

// Generate menu JSON from registered commands
async function generateMenu(sock) {
  const categories = getCategories();
  const menu = {};
  for (const [cat, cmdList] of categories) {
    menu[cat] = { commands: [] };
    for (const cmd of cmdList) {
      const info = getAllCommands().get(cmd);
      if (info) {
        menu[cat].commands.push({
          cmd: cmd,
          desc: info.desc || 'No description',
          reaction: info.reaction || '📌',
        });
      }
    }
  }
  // Write to menu.json
  await fs.writeJson(path.join(__dirname, '..', 'menu.json'), { menu }, { spaces: 2 });
  console.log('📋 Menu updated.');
}

// Get formatted menu string for WhatsApp
function formatMenu(sock, prefix = config.prefix) {
  const categories = getCategories();
  let text = `*${config.botName} - Menu*\n`;
  text += `👑 *Owner:* ${config.ownerName}\n`;
  text += `📌 *Prefix:* ${prefix}\n`;
  text += `📅 *Uptime:* ${process.uptime().toFixed(0)}s\n\n`;
  for (const [cat, cmdList] of categories) {
    text += `*${cat.toUpperCase()}*\n`;
    for (const cmd of cmdList) {
      const info = getAllCommands().get(cmd);
      if (info) {
        text += `  ${prefix}${cmd}  →  ${info.desc || 'No description'}\n`;
      }
    }
    text += '\n';
  }
  text += `\n🔗 *Group:* ${config.groupLink}\n`;
  text += `📺 *Channel:* ${config.channelLink}\n`;
  text += `⚡ *BUGGU-MD*`;
  return text;
}

module.exports = { generateMenu, formatMenu };
