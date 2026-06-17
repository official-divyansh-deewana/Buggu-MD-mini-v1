const { OpenAI } = require('openai');
const config = require('../config');

const openai = new OpenAI({ apiKey: config.openAIApiKey });

module.exports = [
  {
    cmd: 'ai',
    desc: 'Ask AI (GPT)',
    reaction: '🤖',
    category: 'ai',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .ai your question' });
        return;
      }
      if (!config.openAIApiKey) {
        await sock.sendMessage(from, { text: '❌ OpenAI API key not set.' });
        return;
      }
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: fullArgs }],
          max_tokens: 1000,
        });
        const reply = response.choices[0].message.content.trim();
        await sock.sendMessage(from, { text: `🤖 ${reply}` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'gpt',
    desc: 'Ask GPT',
    reaction: '🧠',
    category: 'ai',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      // Same as .ai
      const cmd = module.exports.find(c => c.cmd === 'ai');
      await cmd.execute(sock, msg, from, sender, args, fullArgs, isOwner, isAdmin);
    }
  },
  {
    cmd: 'bugguai',
    desc: 'BUGGU AI assistant',
    reaction: '🤖',
    category: 'ai',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: '🔄 BUGGU AI is powered by OpenAI. Use .ai to ask.' });
    }
  },
  {
    cmd: 'ask',
    desc: 'Ask anything',
    reaction: '❓',
    category: 'ai',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const cmd = module.exports.find(c => c.cmd === 'ai');
      await cmd.execute(sock, msg, from, sender, args, fullArgs, isOwner, isAdmin);
    }
  },
  {
    cmd: 'imageai',
    desc: 'Generate image from text (DALL·E)',
    reaction: '🖼️',
    category: 'ai',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .imageai description' });
        return;
      }
      if (!config.openAIApiKey) {
        await sock.sendMessage(from, { text: '❌ OpenAI API key not set.' });
        return;
      }
      try {
        const response = await openai.images.generate({
          prompt: fullArgs,
          n: 1,
          size: '1024x1024',
        });
        const imageUrl = response.data[0].url;
        await sock.sendMessage(from, { image: { url: imageUrl }, caption: '🖼️ Generated image' });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'codeai',
    desc: 'Generate code',
    reaction: '💻',
    category: 'ai',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .codeai description' });
        return;
      }
      if (!config.openAIApiKey) {
        await sock.sendMessage(from, { text: '❌ OpenAI API key not set.' });
        return;
      }
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Write code for: ${fullArgs}` }],
          max_tokens: 1500,
        });
        const code = response.choices[0].message.content;
        await sock.sendMessage(from, { text: `💻 ${code}` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'chat',
    desc: 'Chat with bot',
    reaction: '💬',
    category: 'ai',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      // Simple echo or AI? Use AI if key present else echo.
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .chat message' });
        return;
      }
      if (config.openAIApiKey) {
        const cmd = module.exports.find(c => c.cmd === 'ai');
        await cmd.execute(sock, msg, from, sender, args, fullArgs, isOwner, isAdmin);
      } else {
        await sock.sendMessage(from, { text: `💬 You said: ${fullArgs}` });
      }
    }
  },
  {
    cmd: 'translate',
    desc: 'Translate text',
    reaction: '🌐',
    category: 'ai',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .translate [target_lang] text' });
        return;
      }
      // Simple translation using Google Translate (requires library)
      // For demo, we'll use a free API or fallback.
      await sock.sendMessage(from, { text: '🌐 Translation feature requires API key. Not implemented.' });
    }
  },
  {
    cmd: 'explain',
    desc: 'Explain something',
    reaction: '📚',
    category: 'ai',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .explain topic' });
        return;
      }
      if (!config.openAIApiKey) {
        await sock.sendMessage(from, { text: '❌ OpenAI API key not set.' });
        return;
      }
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Explain: ${fullArgs}` }],
          max_tokens: 1000,
        });
        const explanation = response.choices[0].message.content;
        await sock.sendMessage(from, { text: `📚 ${explanation}` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
];
