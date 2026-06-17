const fs = require('fs-extra');
const path = require('path');
const { models } = require('./database');

class MongoStore {
  constructor(sessionName) {
    this.sessionName = sessionName;
    this.sessionDir = path.join(__dirname, '..', 'session');
  }

  async initialize() {
    await fs.ensureDir(this.sessionDir);
    // Ensure creds.json exists with at least empty object
    const credsPath = path.join(this.sessionDir, 'creds.json');
    if (!await fs.pathExists(credsPath)) {
      await fs.writeJson(credsPath, {}, { spaces: 2 });
    }
    const keysPath = path.join(this.sessionDir, 'keys.json');
    if (!await fs.pathExists(keysPath)) {
      await fs.writeJson(keysPath, {}, { spaces: 2 });
    }
    console.log(`📂 Session directory ready: ${this.sessionDir}`);
  }

  async getState() {
    // Use Baileys' built-in file-based auth
    const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);

    // Override saveCreds to also save to MongoDB
    const originalSave = saveCreds;
    const enhancedSave = async () => {
      await originalSave();
      try {
        const credsPath = path.join(this.sessionDir, 'creds.json');
        const keysPath = path.join(this.sessionDir, 'keys.json');
        const creds = await fs.readJson(credsPath);
        const keys = await fs.readJson(keysPath);
        await models.Session.findOneAndUpdate(
          { sessionName: this.sessionName },
          { data: { creds, keys }, updatedAt: new Date() },
          { upsert: true }
        );
        console.log(`💾 Session backed up to MongoDB`);
      } catch (err) {
        console.error('❌ Failed to backup session to MongoDB:', err);
      }
    };

    return { state, saveCreds: enhancedSave };
  }

  async delete() {
    await models.Session.deleteOne({ sessionName: this.sessionName });
    await fs.remove(this.sessionDir);
    console.log(`🗑️ Session ${this.sessionName} deleted`);
  }
}

module.exports = { MongoStore };
