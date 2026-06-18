const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs-extra');

class SimpleAuthStore {
  constructor(sessionName) {
    this.sessionDir = path.join(__dirname, '..', 'session', sessionName || 'default');
  }

  async initialize() {
    await fs.ensureDir(this.sessionDir);
    console.log(`📂 Session directory ready: ${this.sessionDir}`);
  }

  async getState() {
    return await useMultiFileAuthState(this.sessionDir);
  }

  async delete() {
    await fs.remove(this.sessionDir);
    console.log(`🗑️ Session deleted: ${this.sessionDir}`);
  }
}

module.exports = { SimpleAuthStore };
