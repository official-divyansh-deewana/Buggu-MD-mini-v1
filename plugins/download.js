const axios = require('axios');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const mediafire = require('mediafire-dl');
const pinterestScraper = require('pinterest-scraper-api');
const tiktok = require('tiktok-scraper-canvas-removed');
const { downloadFile } = require('../lib/utils');
const fs = require('fs-extra');
const path = require('path');

// ─── Helper: Validate URL ──────────────────────────────
function isValidUrl(string) {
  try { new URL(string); return true; } catch { return false; }
}

// ─── Instagram (no key required – uses public API) ──────
async function instagramDownload(url) {
  try {
    const embedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await axios.get(embedUrl);
    return { type: 'image', url: response.data.thumbnail_url, title: response.data.title };
  } catch (e) {
    throw new Error('Instagram download requires a valid API key or session. Not implemented fully.');
  }
}

// ─── Facebook (public API – no key) ──────────────────────
async function facebookDownload(url) {
  try {
    const apiUrl = `https://api.facevideo.net/api/video?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    if (response.data && response.data.video) {
      return { url: response.data.video, quality: response.data.quality || 'SD' };
    } else {
      throw new Error('No video found.');
    }
  } catch (e) {
    throw new Error('Facebook downloader requires API key or service. Not implemented.');
  }
}

// ─── TikTok (using tiktok-scraper-canvas-removed) ──────────
async function tiktokDownload(url) {
  try {
    const videoMeta = await tiktok.getVideoMeta(url);
    if (videoMeta && videoMeta.videoUrl) {
      return { url: videoMeta.videoUrl, title: videoMeta.title || 'TikTok Video' };
    } else {
      throw new Error('No video found.');
    }
  } catch (e) {
    console.error('TikTok download error:', e);
    throw new Error('TikTok downloader failed. Please try again later.');
  }
}

// ─── Twitter (public API – no key) ────────────────────────
async function twitterDownload(url) {
  try {
    // Twitter API v2 requires Bearer token. For now, we throw a clear error.
    throw new Error('Twitter downloader requires Bearer token. Set TWITTER_BEARER_TOKEN in .env');
  } catch (e) {
    throw new Error('Twitter downloader requires Bearer token. Not implemented.');
  }
}

// ─── MediaFire ─────────────────────────────────────────────
async function mediafireDownload(url) {
  try {
    const result = await mediafire.download(url);
    return result.file.link;
  } catch (e) {
    throw new Error('MediaFire download failed. Check the URL.');
  }
}

// ─── Pinterest ─────────────────────────────────────────────
async function pinterestSearch(query) {
  try {
    const images = await pinterestScraper.searchPinterest(query, 5);
    if (images && images.length > 0) {
      return images[0];
    } else {
      throw new Error('No results found.');
    }
  } catch (e) {
    throw new Error('Pinterest search failed: ' + e.message);
  }
}

// ─── Commands ──────────────────────────────────────────────
module.exports = [
  {
    cmd: 'play',
    desc: 'Play audio from YouTube',
    reaction: '🎵',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) return await sock.sendMessage(from, { text: '❌ Usage: .play song name' });
      try {
        const search = await yts(fullArgs);
        const video = search.videos[0];
        if (!video) return await sock.sendMessage(from, { text: '❌ No results found.' });
        const stream = ytdl(video.url, { filter: 'audioonly' });
        await sock.sendMessage(from, { audio: stream, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'song',
    desc: 'Download song from YouTube (alias of .play)',
    reaction: '🎵',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      const cmd = module.exports.find(c => c.cmd === 'play');
      await cmd.execute(sock, msg, from, sender, args, fullArgs, isOwner, isAdmin);
    }
  },
  {
    cmd: 'video',
    desc: 'Download video from YouTube',
    reaction: '🎬',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) return await sock.sendMessage(from, { text: '❌ Usage: .video video name' });
      try {
        const search = await yts(fullArgs);
        const video = search.videos[0];
        if (!video) return await sock.sendMessage(from, { text: '❌ No results found.' });
        const stream = ytdl(video.url, { filter: 'videoandaudio' });
        await sock.sendMessage(from, { video: stream, fileName: `${video.title}.mp4` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'ytmp3',
    desc: 'YouTube to MP3 (by URL)',
    reaction: '🎵',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs || !isValidUrl(fullArgs)) return await sock.sendMessage(from, { text: '❌ Usage: .ytmp3 YouTube_URL' });
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
    desc: 'YouTube to MP4 (by URL)',
    reaction: '🎬',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs || !isValidUrl(fullArgs)) return await sock.sendMessage(from, { text: '❌ Usage: .ytmp4 YouTube_URL' });
      try {
        const stream = ytdl(fullArgs, { filter: 'videoandaudio' });
        await sock.sendMessage(from, { video: stream, fileName: 'video.mp4' });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
      }
    }
  },
  {
    cmd: 'instagram',
    desc: 'Download Instagram media (image/video)',
    reaction: '📷',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs || !isValidUrl(fullArgs)) return await sock.sendMessage(from, { text: '❌ Usage: .instagram URL' });
      try {
        const result = await instagramDownload(fullArgs);
        if (result.type === 'image') {
          await sock.sendMessage(from, { image: { url: result.url }, caption: `📷 Instagram\n${result.title || ''}` });
        } else {
          await sock.sendMessage(from, { video: { url: result.url }, caption: `📷 Instagram\n${result.title || ''}` });
        }
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ ${err.message}` });
      }
    }
  },
  {
    cmd: 'facebook',
    desc: 'Download Facebook video',
    reaction: '📘',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs || !isValidUrl(fullArgs)) return await sock.sendMessage(from, { text: '❌ Usage: .facebook URL' });
      try {
        const result = await facebookDownload(fullArgs);
        await sock.sendMessage(from, { video: { url: result.url }, caption: `📘 Facebook video (${result.quality || 'SD'})` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ ${err.message}` });
      }
    }
  },
  {
    cmd: 'tiktok',
    desc: 'Download TikTok video (no watermark)',
    reaction: '🎶',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs || !isValidUrl(fullArgs)) return await sock.sendMessage(from, { text: '❌ Usage: .tiktok URL' });
      try {
        const result = await tiktokDownload(fullArgs);
        await sock.sendMessage(from, { video: { url: result.url }, caption: `🎶 TikTok\n${result.title || ''}` });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ ${err.message}` });
      }
    }
  },
  {
    cmd: 'twitter',
    desc: 'Download Twitter media (video/image)',
    reaction: '🐦',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs || !isValidUrl(fullArgs)) return await sock.sendMessage(from, { text: '❌ Usage: .twitter URL' });
      try {
        const result = await twitterDownload(fullArgs);
        await sock.sendMessage(from, { video: { url: result.url }, caption: '🐦 Twitter' });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ ${err.message}` });
      }
    }
  },
  {
    cmd: 'mediafire',
    desc: 'Download file from MediaFire',
    reaction: '💾',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs || !isValidUrl(fullArgs)) return await sock.sendMessage(from, { text: '❌ Usage: .mediafire URL' });
      try {
        const link = await mediafireDownload(fullArgs);
        const fileName = fullArgs.split('/').pop() || 'file';
        await sock.sendMessage(from, { document: { url: link }, fileName: fileName, mimetype: 'application/octet-stream' });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ ${err.message}` });
      }
    }
  },
  {
    cmd: 'pinterest',
    desc: 'Search and download Pinterest images',
    reaction: '📌',
    category: 'download',
    execute: async (sock, msg, from, sender, args, fullArgs, isOwner, isAdmin) => {
      if (!fullArgs) return await sock.sendMessage(from, { text: '❌ Usage: .pinterest search query' });
      try {
        const image = await pinterestSearch(fullArgs);
        await sock.sendMessage(from, {
          image: { url: image.imageUrl },
          caption: `📌 *Pinterest Search*\n📝 ${image.title || 'No title'}\n👤 ${image.author || 'Unknown'}\n🔗 ${image.originalUrl || ''}`
        });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ ${err.message}` });
      }
    }
  },
];
