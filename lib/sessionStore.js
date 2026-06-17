const fs = require('fs-extra');
const path = require('path');
const { models } = require('./database');

class MongoStore {
  constructor(sessionName) {
    this.sessionName = sessionName;
    this.sessionDir = path.join(__dirname, '..', 'session');
  }

  async initialize() {
    // Ensure session directory exists
    await fs.ensureDir(this.sessionDir);

    // Load session from MongoDB
    const doc = await models.Session.findOne({ sessionName: this.sessionName });
    if (doc && doc.data) {
      // Write the session data to files in the session directory
      const credsPath = path.join(this.sessionDir, 'creds.json');
      const keysPath = path.join(this.sessionDir, 'keys.json');
      
      // Ensure creds and keys exist
      if (doc.data.creds) {
        await fs.writeJson(credsPath, doc.data.creds, { spaces: 2 });
      }
      if (doc.data.keys) {
        await fs.writeJson(keysPath, doc.data.keys, { spaces: 2 });
      }
      console.log(`📂 Session loaded from MongoDB for ${this.sessionName}`);
    } else {
      console.log(`🆕 New session for ${this.sessionName}`);
    }
  }

  async getState() {
    // Use Baileys' built-in file-based auth
    const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);

    // Override saveCreds to also save to MongoDB
    const originalSave = saveCreds;
    const enhancedSave = async () => {
      await originalSave();
      // Read the files and save to MongoDB
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
        console.log(`💾 Session saved to MongoDB for ${this.sessionName}`);
      } catch (err) {
        console.error('❌ Failed to save session to MongoDB:', err);
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
