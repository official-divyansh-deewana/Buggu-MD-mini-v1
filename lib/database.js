const mongoose = require('mongoose');
const config = require('../config');

// Define schemas
const UserSchema = new mongoose.Schema({
  jid: { type: String, unique: true, required: true },
  name: String,
  banned: { type: Boolean, default: false },
  premium: { type: Boolean, default: false },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

const SessionSchema = new mongoose.Schema({
  sessionName: { type: String, unique: true, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const SettingSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
});

const StatSchema = new mongoose.Schema({
  commands: { type: Number, default: 0 },
  users: { type: Number, default: 0 },
  groups: { type: Number, default: 0 },
  messages: { type: Number, default: 0 },
  uptime: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now },
});

const GroupSchema = new mongoose.Schema({
  jid: { type: String, unique: true, required: true },
  name: String,
  participants: [String],
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
});

const WarningSchema = new mongoose.Schema({
  userJid: String,
  groupJid: String,
  reason: String,
  warnedBy: String,
  date: { type: Date, default: Date.now },
});

const PremiumSchema = new mongoose.Schema({
  userJid: { type: String, unique: true },
  expires: Date,
  plan: String,
});

const BanSchema = new mongoose.Schema({
  userJid: { type: String, unique: true },
  reason: String,
  bannedBy: String,
  date: { type: Date, default: Date.now },
});

const OtpSchema = new mongoose.Schema({
  phone: { type: String, unique: true },
  code: String,
  expires: Date,
});

const models = {
  User: mongoose.model('User', UserSchema),
  Session: mongoose.model('Session', SessionSchema),
  Setting: mongoose.model('Setting', SettingSchema),
  Stat: mongoose.model('Stat', StatSchema),
  Group: mongoose.model('Group', GroupSchema),
  Warning: mongoose.model('Warning', WarningSchema),
  Premium: mongoose.model('Premium', PremiumSchema),
  Ban: mongoose.model('Ban', BanSchema),
  Otp: mongoose.model('Otp', OtpSchema),
};

// Connect to MongoDB
async function connect() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}

// Stats
async function updateStats(command) {
  const stat = await models.Stat.findOneAndUpdate(
    {},
    { $inc: { commands: 1 } },
    { upsert: true, new: true }
  );
  return stat;
}

async function getStats() {
  let stat = await models.Stat.findOne();
  if (!stat) {
    stat = await models.Stat.create({});
  }
  return stat;
}

// User management
async function getUser(jid) {
  let user = await models.User.findOne({ jid });
  if (!user) {
    user = await models.User.create({ jid });
  }
  return user;
}

async function setUserBanned(jid, banned) {
  const user = await getUser(jid);
  user.banned = banned;
  await user.save();
  return user;
}

async function setUserPremium(jid, premium) {
  const user = await getUser(jid);
  user.premium = premium;
  await user.save();
  return user;
}

// Settings
async function getSetting(key) {
  const setting = await models.Setting.findOne({ key });
  return setting ? setting.value : undefined;
}

async function setSetting(key, value) {
  await models.Setting.findOneAndUpdate(
    { key },
    { value },
    { upsert: true }
  );
}

// Group
async function getGroup(jid) {
  let group = await models.Group.findOne({ jid });
  if (!group) {
    group = await models.Group.create({ jid });
  }
  return group;
}

async function updateGroup(jid, data) {
  return await models.Group.findOneAndUpdate(
    { jid },
    data,
    { upsert: true, new: true }
  );
}

// Warning
async function addWarning(userJid, groupJid, reason, warnedBy) {
  const warn = await models.Warning.create({
    userJid,
    groupJid,
    reason,
    warnedBy,
  });
  return warn;
}

async function getWarnings(userJid, groupJid) {
  return await models.Warning.find({ userJid, groupJid });
}

// Export all
module.exports = {
  connect,
  models,
  updateStats,
  getStats,
  getUser,
  setUserBanned,
  setUserPremium,
  getSetting,
  setSetting,
  getGroup,
  updateGroup,
  addWarning,
  getWarnings,
};
