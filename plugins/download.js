const axios = require('axios');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const { downloadFile } = require('../lib/utils');
const fs = require('fs-extra');
const path = require('path');
const { random } = require('../lib/utils');

module.exports = [
  {
    cmd: 'play',
    desc: 'Play audio from YouTube',
    reaction: '🎵',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .play song name' });
        return;
      }
      try {
        const search = await yts(fullArgs);
        const video = search.videos[0];
        if (!video) {
          await sock.sendMessage(from, { text: '❌ No results found.' });
          return;
        }
        const stream = ytdl(video.url, { filter: 'audioonly' });
        await sock.sendMessage(from, { audio: stream, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'song',
    desc: 'Download song from YouTube',
    reaction: '🎵',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      // Same as play but sends as document?
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .song song name' });
        return;
      }
      try {
        const search = await yts(fullArgs);
        const video = search.videos[0];
        if (!video) {
          await sock.sendMessage(from, { text: '❌ No results found.' });
          return;
        }
        const stream = ytdl(video.url, { filter: 'audioonly' });
        await sock.sendMessage(from, { audio: stream, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'video',
    desc: 'Download video from YouTube',
    reaction: '🎬',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .video video name' });
        return;
      }
      try {
        const search = await yts(fullArgs);
        const video = search.videos[0];
        if (!video) {
          await sock.sendMessage(from, { text: '❌ No results found.' });
          return;
        }
        const stream = ytdl(video.url, { filter: 'videoandaudio' });
        await sock.sendMessage(from, { video: stream, fileName: `${video.title}.mp4` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'ytmp3',
    desc: 'YouTube to MP3',
    reaction: '🎵',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      // Similar to play
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .ytmp3 YouTube URL' });
        return;
      }
      try {
        const stream = ytdl(fullArgs, { filter: 'audioonly' });
        await sock.sendMessage(from, { audio: stream, mimetype: 'audio/mpeg', fileName: 'audio.mp3' });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'ytmp4',
    desc: 'YouTube to MP4',
    reaction: '🎬',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) {
        await sock.sendMessage(from, { text: '❌ Usage: .ytmp4 YouTube URL' });
        return;
      }
      try {
        const stream = ytdl(fullArgs, { filter: 'videoandaudio' });
        await sock.sendMessage(from, { video: stream, fileName: 'video.mp4' });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  // Other download commands (instagram, facebook, etc.) would require API keys and proper libraries.
  // For brevity, we provide stubs.
  {
    cmd: 'instagram',
    desc: 'Download Instagram media',
    reaction: '📷',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: '❌ Instagram downloader requires API key. Not implemented.' });
    }
  },
  {
    cmd: 'facebook',
    desc: 'Download Facebook video',
    reaction: '📘',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: '❌ Facebook downloader requires API key. Not implemented.' });
    }
  },
  {
    cmd: 'tiktok',
    desc: 'Download TikTok video',
    reaction: '🎶',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: '❌ TikTok downloader requires API key. Not implemented.' });
    }
  },
  {
    cmd: 'twitter',
    desc: 'Download Twitter media',
    reaction: '🐦',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: '❌ Twitter downloader requires API key. Not implemented.' });
    }
  },
  {
    cmd: 'mediafire',
    desc: 'Download from MediaFire',
    reaction: '💾',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: '❌ MediaFire downloader requires API key. Not implemented.' });
    }
  },
  {
    cmd: 'pinterest',
    desc: 'Download Pinterest image',
    reaction: '📌',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      await sock.sendMessage(from, { text: '❌ Pinterest downloader requires API key. Not implemented.' });
    }
  },
];
