const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

// Sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get random item
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Format time
function formatTime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

// Download file to temp
async function downloadFile(url, filename) {
  const dir = path.join(__dirname, '..', 'temp');
  await fs.ensureDir(dir);
  const filePath = path.join(dir, filename);
  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

// Check if user is banned
async function isBanned(jid) {
  const db = require('./database');
  const user = await db.getUser(jid);
  return user.banned;
}

// Check if user is premium
async function isPremium(jid) {
  const db = require('./database');
  const user = await db.getUser(jid);
  return user.premium;
}

module.exports = {
  sleep,
  random,
  formatTime,
  downloadFile,
  isBanned,
  isPremium,
};
