const fs = require('fs-extra');
const path = require('path');
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { models } = require('./database');

class MongoStore {
  constructor(sessionName) {
    this.sessionName = sessionName;
    this.sessionDir = path.join(__dirname, '..', 'session');
  }

  async initialize() {
    await fs.ensureDir(this.sessionDir);
    // Ensure we have valid creds/keys files even if empty
    const credsPath = path.join(this.sessionDir, 'creds.json');
    const keysPath = path.join(this.sessionDir, 'keys.json');
    if (!await fs.pathExists(credsPath)) {
      await fs.writeJson(credsPath, {});
    }
    if (!await fs.pathExists(keysPath)) {
      await fs.writeJson(keysPath, {});
    }
  }

  async getState() {
    // Use Baileys' built-in file-based auth
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
    return { state, saveCreds };
  }
}

module.exports = { MongoStore };
