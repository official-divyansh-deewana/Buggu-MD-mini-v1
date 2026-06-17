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
    
    // Load from MongoDB and write to files
    const doc = await models.Session.findOne({ sessionName: this.sessionName });
    if (doc && doc.data) {
      const credsPath = path.join(this.sessionDir, 'creds.json');
      await fs.writeJson(credsPath, doc.data, { spaces: 2 });
      console.log(`📂 Session loaded from MongoDB for ${this.sessionName}`);
    } else {
      console.log(`🆕 New session for ${this.sessionName}`);
    }
  }

  async getState() {
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
    
    // Override saveCreds to also save to MongoDB
    const originalSave = saveCreds;
    const enhancedSave = async () => {
      await originalSave();
      try {
        const credsPath = path.join(this.sessionDir, 'creds.json');
        const creds = await fs.readJson(credsPath);
        await models.Session.findOneAndUpdate(
          { sessionName: this.sessionName },
          { data: creds, updatedAt: new Date() },
          { upsert: true }
        );
        console.log(`💾 Session saved to MongoDB for ${this.sessionName}`);
      } catch (err) {
        console.error('❌ Failed to save session:', err);
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
