const express = require('express');
const router = express.Router();
const path = require('path');
const config = require('../config');

// Serve the pair.html
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pair.html'));
});

// Generate pair code (this would use Baileys's requestPairingCode)
// However, we need the socket instance. For simplicity, we'll just return a mock.
// In production, you'd integrate with the bot's socket.
router.post('/generate', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number required' });
  }
  // This is a mock; real implementation would use sock.requestPairingCode(phone)
  // For now, we'll return a random code.
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  res.json({ code });
});

module.exports = router;
