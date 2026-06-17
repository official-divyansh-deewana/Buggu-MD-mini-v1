const mongoose = require('mongoose');
const { models } = require('./database');

class MongoStore {
  constructor(sessionName) {
    this.sessionName = sessionName;
    this.state = null;
  }

  async initialize() {
    const doc = await models.Session.findOne({ sessionName: this.sessionName });
    if (doc && doc.data) {
      this.state = doc.data;
      console.log(`📂 Session loaded from DB for ${this.sessionName}`);
    } else {
      // ✅ Initialize with empty creds and keys (Baileys will fill them)
      this.state = {
        creds: {},
        keys: {},
      };
      console.log(`🆕 New session for ${this.sessionName}`);
    }
  }

  async getState() {
    return {
      state: this.state,
      saveCreds: async () => {
        await models.Session.findOneAndUpdate(
          { sessionName: this.sessionName },
          { data: this.state, updatedAt: new Date() },
          { upsert: true }
        );
        console.log(`💾 Session saved to DB for ${this.sessionName}`);
      },
    };
  }

  async save() {
    await models.Session.findOneAndUpdate(
      { sessionName: this.sessionName },
      { data: this.state, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async delete() {
    await models.Session.deleteOne({ sessionName: this.sessionName });
    console.log(`🗑️ Session ${this.sessionName} deleted from DB`);
  }
}

module.exports = { MongoStore };
