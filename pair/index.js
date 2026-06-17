const express = require('express');
const router = express.Router();
const path = require('path');
const { getSock } = require('../index');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pair.html'));
});

router.post('/generate', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) {
    return res.status(400).json({ error: 'Invalid phone number.' });
  }
  const sock = getSock();
  if (!sock) {
    return res.status(503).json({ 
      error: 'Bot is not connected yet. Please wait or use QR code from logs.',
      fallback: 'qr'
    });
  }
  try {
    const code = await sock.requestPairingCode(cleanPhone);
    res.json({ code });
  } catch (err) {
    console.error('Pairing error:', err);
    if (err.message.includes('not authenticated') || err.message.includes('noiseKey')) {
      return res.status(503).json({ 
        error: 'Bot not authenticated. Please use QR code from logs.',
        fallback: 'qr'
      });
    }
    res.status(500).json({ error: err.message || 'Failed to generate pair code.' });
  }
});

module.exports = router;
