const express = require('express');
const router = express.Router();
const path = require('path');
const { sock, getQR, resetSession } = require('../index');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pair.html'));
});

// QR endpoint
router.get('/qr', (req, res) => {
  try {
    const qr = getQR();
    if (qr) {
      return res.json({ qr });
    } else {
      return res.status(404).json({ error: 'QR not available. Bot may be already connected or not yet ready.', fallback: 'pair' });
    }
  } catch (err) {
    console.error('❌ QR endpoint error:', err);
    return res.status(500).json({ error: 'Internal error: ' + err.message });
  }
});

// Reset session endpoint
router.post('/reset', async (req, res) => {
  try {
    await resetSession();
    res.json({ success: true, message: 'Session reset. Bot will restart and generate new QR.' });
  } catch (err) {
    console.error('❌ Reset error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Pair code endpoint
router.post('/generate', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) {
    return res.status(400).json({ error: 'Invalid phone number.' });
  }

  const currentSock = sock();
  if (!currentSock) {
    return res.status(503).json({ 
      error: 'Bot is not connected. Please scan QR code first.',
      fallback: 'qr'
    });
  }

  try {
    const code = await currentSock.requestPairingCode(cleanPhone);
    res.json({ code });
  } catch (err) {
    console.error('❌ Pairing error:', err);
    if (err.message && (err.message.includes('not authenticated') || err.message.includes('noiseKey'))) {
      return res.status(503).json({ 
        error: 'Bot not authenticated. Please scan QR code first.',
        fallback: 'qr'
      });
    }
    res.status(500).json({ error: err.message || 'Failed to generate pair code.' });
  }
});

module.exports = router;
