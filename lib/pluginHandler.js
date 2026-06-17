const fs = require('fs-extra');
const path = require('path');
const config = require('../config');
const { generateMenu } = require('./menu');

// Registry of commands
let commands = new Map();
let categories = new Map();

// Load all plugins from plugins/ folder
async function loadAll(sock) {
  const pluginDir = path.join(__dirname, '..', 'plugins');
  const files = await fs.readdir(pluginDir);
  for (const file of files) {
    if (file.endsWith('.js')) {
      try {
        const plugin = require(path.join(pluginDir, file));
        if (Array.isArray(plugin)) {
          plugin.forEach(cmd => registerCommand(cmd, file));
        } else if (typeof plugin === 'object') {
          // single command object
          if (plugin.cmd || plugin.name) {
            registerCommand(plugin, file);
          }
        }
        console.log(`✅ Loaded plugin: ${file}`);
      } catch (err) {
        console.error(`❌ Failed to load plugin ${file}:`, err);
      }
    }
  }
  // Update menu after loading
  await generateMenu(sock);
  return commands;
}

function registerCommand(cmdObj, file) {
  const cmd = cmdObj.cmd || cmdObj.name;
  if (!cmd) return;
  commands.set(cmd, {
    ...cmdObj,
    file,
    // Ensure required fields
    execute: cmdObj.execute || cmdObj.handler || (() => {}),
    reaction: cmdObj.reaction || '📌',
    ownerOnly: cmdObj.ownerOnly || false,
    adminOnly: cmdObj.adminOnly || false,
    cooldown: cmdObj.cooldown || 2,
    category: cmdObj.category || 'general',
  });
  // Track categories
  if (!categories.has(cmdObj.category)) {
    categories.set(cmdObj.category, []);
  }
  categories.get(cmdObj.category).push(cmd);
}

function getCommand(cmd) {
  return commands.get(cmd) || null;
}

function getAllCommands() {
  return commands;
}

function getCategories() {
  return categories;
}

// Reload a specific plugin (hot reload)
async function reloadPlugin(file) {
  const pluginPath = path.join(__dirname, '..', 'plugins', file);
  // Remove from require cache
  delete require.cache[require.resolve(pluginPath)];
  // Remove existing commands from that file
  const toRemove = [];
  for (const [cmd, info] of commands) {
    if (info.file === file) toRemove.push(cmd);
  }
  toRemove.forEach(cmd => commands.delete(cmd));
  // Reload
  const plugin = require(pluginPath);
  if (Array.isArray(plugin)) {
    plugin.forEach(cmd => registerCommand(cmd, file));
  } else if (typeof plugin === 'object') {
    registerCommand(plugin, file);
  }
  console.log(`🔄 Reloaded plugin: ${file}`);
  return commands;
}

module.exports = {
  loadAll,
  getCommand,
  getAllCommands,
  getCategories,
  reloadPlugin,
};
