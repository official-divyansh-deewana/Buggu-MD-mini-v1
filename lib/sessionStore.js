const { MongoStore as BaseMongoStore } = require('@whiskeysockets/baileys');
const mongoose = require('mongoose');
const { models } = require('./database');

class MongoStore {
  constructor(sessionName) {
    this.sessionName = sessionName;
    this.state = null;
  }

  async initialize() {
    // Load session from DB
    const doc = await models.Session.findOne({ sessionName: this.sessionName });
    if (doc) {
      this.state = doc.data;
      console.log(`📂 Session loaded from DB for ${this.sessionName}`);
    } else {
      this.state = {};
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

  // For compatibility with Baileys's MultiFileAuthState pattern
  async save() {
    await models.Session.findOneAndUpdate(
      { sessionName: this.sessionName },
      { data: this.state, updatedAt: new Date() },
      { upsert: true }
    );
  }

  // Utility: delete session
  async delete() {
    await models.Session.deleteOne({ sessionName: this.sessionName });
    console.log(`🗑️ Session ${this.sessionName} deleted from DB`);
  }
}

module.exports = { MongoStore };
