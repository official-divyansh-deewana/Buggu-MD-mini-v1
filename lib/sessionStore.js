const mongoose = require('mongoose');
const { models } = require('./database');

class MongoStore {
  constructor(sessionName) {
    this.sessionName = sessionName;
    this.state = null;
  }

  async initialize() {
    try {
      const doc = await models.Session.findOne({ sessionName: this.sessionName });
      if (doc && doc.data) {
        this.state = doc.data;
        // Ensure creds and keys exist even if they are empty
        if (!this.state.creds) this.state.creds = {};
        if (!this.state.keys) this.state.keys = {};
        console.log(`📂 Session loaded from DB for ${this.sessionName}`);
      } else {
        // New session: start with minimal structure
        this.state = {
          creds: {},
          keys: {},
        };
        console.log(`🆕 New session for ${this.sessionName}`);
      }
    } catch (err) {
      console.error('❌ Error initializing session:', err);
      // Fallback to new session
      this.state = {
        creds: {},
        keys: {},
      };
    }
  }

  async getState() {
    // Ensure state is not null
    if (!this.state) {
      this.state = { creds: {}, keys: {} };
    }
    return {
      state: this.state,
      saveCreds: async () => {
        try {
          await models.Session.findOneAndUpdate(
            { sessionName: this.sessionName },
            { data: this.state, updatedAt: new Date() },
            { upsert: true }
          );
          console.log(`💾 Session saved to DB for ${this.sessionName}`);
        } catch (err) {
          console.error('❌ Failed to save session:', err);
        }
      },
    };
  }

  async save() {
    await this.getState().saveCreds();
  }

  async delete() {
    await models.Session.deleteOne({ sessionName: this.sessionName });
    console.log(`🗑️ Session ${this.sessionName} deleted from DB`);
  }
}

module.exports = { MongoStore };
