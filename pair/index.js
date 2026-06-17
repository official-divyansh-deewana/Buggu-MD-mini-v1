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
    return res.status(400).json({ error: 'Phone number required' });
  }
  const sock = getSock();
  if (!sock) {
    return res.status(503).json({ error: 'Bot is not connected. Please try again later.' });
  }
  try {
    const code = await sock.requestPairingCode(phone);
    res.json({ code });
  } catch (err) {
    console.error('Pairing error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate pair code' });
  }
});

module.exports = router;
