const axios = require('axios');
const moment = require('moment');
const { random, downloadFile } = require('../lib/utils');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = [
  {
    cmd: 'weather',
    desc: 'Get weather',
    reaction: '☀️',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .weather city' });
        return;
      }
      // Use OpenWeatherMap API (you need to set API key)
      try {
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
          await sock.sendMessage(from, { text: '❌ Weather API key not set.' });
          return;
        }
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(fullArgs)}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;
        const text = `☀️ *Weather in ${data.name}*\n🌡️ Temperature: ${data.main.temp}°C\n💧 Humidity: ${data.main.humidity}%\n🌬️ Wind: ${data.wind.speed} m/s\n📝 ${data.weather[0].description}`;
        await sock.sendMessage(from, { text });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'time',
    desc: 'Current time',
    reaction: '🕐',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const now = moment().format('LLLL');
      await sock.sendMessage(from, { text: `🕐 ${now}` });
    }
  },
  {
    cmd: 'calculator',
    desc: 'Calculate expression',
    reaction: '🧮',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .calculator expression' });
        return;
      }
      try {
        // Simple eval for math expressions
        const result = Function(`"use strict"; return (${fullArgs})`)();
        await sock.sendMessage(from, { text: `🧮 ${fullArgs} = ${result}` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'qr',
    desc: 'Generate QR code',
    reaction: '📱',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .qr text' });
        return;
      }
      const QRCode = require('qrcode');
      try {
        const qr = await QRCode.toDataURL(fullArgs);
        await sock.sendMessage(from, { image: { url: qr }, caption: '📱 QR Code' });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'readmore',
    desc: 'Add read more separator',
    reaction: '📄',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      // In WhatsApp, you can use "----" or similar to create a read more
      await sock.sendMessage(from, { text: `${fullArgs || 'Read more below'}\n\n----\n\n...` });
    }
  },
  {
    cmd: 'sticker',
    desc: 'Make sticker from image',
    reaction: '🖼️',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || !quoted.imageMessage) {
        await sock.sendMessage(from, { text: '❌ Reply to an image to make sticker.' });
        return;
      }
      try {
        const media = await sock.downloadMediaMessage(msg);
        await sock.sendMessage(from, { sticker: media, packname: 'BUGGU-MD', author: config.ownerName });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'take',
    desc: 'Take sticker with pack info',
    reaction: '🖼️',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || !quoted.stickerMessage) {
        await sock.sendMessage(from, { text: '❌ Reply to a sticker to take.' });
        return;
      }
      const [packname, author] = fullArgs.split('|').map(s => s.trim());
      // Download the sticker, then resend with new pack info.
      const media = await sock.downloadMediaMessage(msg);
      await sock.sendMessage(from, { sticker: media, packname: packname || 'BUGGU-MD', author: author || config.ownerName });
    }
  },
  {
    cmd: 'toimg',
    desc: 'Convert sticker to image',
    reaction: '🔄',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || !quoted.stickerMessage) {
        await sock.sendMessage(from, { text: '❌ Reply to a sticker to convert.' });
        return;
      }
      const media = await sock.downloadMediaMessage(msg);
      await sock.sendMessage(from, { image: media, caption: '🔄 Converted sticker to image' });
    }
  },
  {
    cmd: 'tomp3',
    desc: 'Convert video to audio',
    reaction: '🎵',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || !quoted.videoMessage) {
        await sock.sendMessage(from, { text: '❌ Reply to a video to convert.' });
        return;
      }
      const media = await sock.downloadMediaMessage(msg);
      const tempPath = path.join(__dirname, '..', 'temp', `video_${Date.now()}.mp4`);
      const audioPath = tempPath.replace('.mp4', '.mp3');
      await fs.writeFile(tempPath, media);
      await execPromise(`ffmpeg -i ${tempPath} -vn -acodec libmp3lame -ab 192k ${audioPath}`);
      const audioBuffer = await fs.readFile(audioPath);
      await sock.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mpeg' });
      await fs.unlink(tempPath);
      await fs.unlink(audioPath);
    }
  },
  {
    cmd: 'toptt',
    desc: 'Convert text to TTS',
    reaction: '🔊',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .toptt text' });
        return;
      }
      // Use Google TTS (requires API key) or use a free service.
      // For demo, we'll use a simple public API.
      try {
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(fullArgs)}`;
        await sock.sendMessage(from, { audio: { url }, mimetype: 'audio/mpeg' });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'tts',
    desc: 'Text to speech',
    reaction: '🗣️',
    category: 'utility',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      // Alias for .toptt
      const cmd = module.exports.find(c => c.cmd === 'toptt');
      await cmd.execute(sock, msg, from, sender, args, fullArgs, isOwner, isAdmin);
    }
  },
];
