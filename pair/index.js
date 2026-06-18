const express = require('express');
const router = express.Router();
const path = require('path');
const { sock, getQR } = require('../index');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pair.html'));
});

// QR endpoint – returns JSON with QR data or error
router.get('/qr', (req, res) => {
  try {
    // Get QR from exported function
    let qrData = null;
    if (typeof getQR === 'function') {
      qrData = getQR();
    } else {
      // Fallback: read global directly
      qrData = global.qrCodeData;
    }

    if (qrData) {
      return res.json({ qr: qrData });
    } else {
      // QR not available – could be because bot is already connected or still starting
      return res.status(404).json({ 
        error: 'QR not available. Bot may be already connected or not yet ready.',
        fallback: 'pair' // tell client to try pair code
      });
    }
  } catch (err) {
    console.error('❌ QR endpoint error:', err);
    return res.status(500).json({ 
      error: 'Internal error: ' + err.message,
      fallback: 'pair'
    });
  }
});

// Pair code endpoint – generates 8-digit code
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
