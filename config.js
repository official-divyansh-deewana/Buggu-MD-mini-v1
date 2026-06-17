require('dotenv').config();

module.exports = {
  botName: 'ᘋ᎑ԍԍ᎑-Ⲙᴅ',
  ownerName: '𓆩〭〬🐣⃪⃮⃔⃝꯭꯭〬ꯦ꯭꯭Ꭷɣ֯֯፝֟͠ɛ 𝐁սԍ͢ԍ𝛖',
  ownerNumber: process.env.OWNER_NUMBER || '918882829982',
  prefix: process.env.PREFIX || ',',
  mode: process.env.MODE || 'private', // 'public' or 'private'
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://offarslan_db_user:arslanmd@cluster0.xrqkzwg.mongodb.net/?appName=Cluster0',
  botLogo: 'https://files.catbox.moe/oz0kzb.png',
  menuImage: 'https://files.catbox.moe/oz0kzb.png',
  welcomeImage: 'https://files.catbox.moe/oz0kzb.png',
  goodbyeImage: 'https://files.catbox.moe/oz0kzb.png',
  groupLink: 'https://chat.whatsapp.com/DyiDSuY2ChdJQE6GCWzCH6',
  channelLink: 'https://whatsapp.com/channel/0029Vb0dS3e3bbV4T5EGDu1q',
  channelJid: '120363377933108135@newsletter',
  sessionName: process.env.SESSION_NAME || 'buggu_session',
  pairPort: process.env.PAIR_PORT || 3000,
  openAIApiKey: process.env.OPENAI_API_KEY || '',
  // API keys for download commands (add your own)
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  instagramSession: process.env.INSTAGRAM_SESSION || '',
  tiktokSession: process.env.TIKTOK_SESSION || '',
  twitterBearer: process.env.TWITTER_BEARER_TOKEN || '',
};
