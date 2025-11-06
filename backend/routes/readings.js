// routes/readings.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Reading = require('../models/Reading');
const forwardToMl = require('../utils/forwardToMl');

const upload = multer({ dest: 'temp/' });
const router = express.Router();

// POST /api/readings/analyze
router.post('/analyze', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No audio file' });

    // optional sensors in multipart form fields
    const sensors = {
      noise_db: req.body.noise_db && Number(req.body.noise_db),
      light: req.body.light && Number(req.body.light),
      temperature: req.body.temperature && Number(req.body.temperature),
      humidity: req.body.humidity && Number(req.body.humidity),
      hr: req.body.hr && Number(req.body.hr)
    };

    // forward audio to ML service
    const mlResult = await forwardToMl(path.resolve(file.path), sensors, process.env.ML_SERVICE_URL);

    // build reading document
    const reading = new Reading({
      userId: req.body.userId || null,
      source: req.body.source || 'web',
      stress: mlResult.stress_score ?? mlResult.stress,
      fatigue: mlResult.fatigue_score ?? mlResult.fatigue,
      recommendation: mlResult.recommendation || mlResult.rec || '',
      sensors,
      timestamp: new Date()
      // evidenceUrl: optional upload to S3/Cloudinary
    });

    await reading.save();

    // emit event via Socket.io (we will set io on req.app in index.js)
    if (req.app.get('io')) req.app.get('io').emit('new_reading', reading);

    // cleanup temp file
    fs.unlinkSync(file.path);

    res.json({ ok: true, data: reading });
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /api/readings/history
router.get('/history', async (req, res) => {
  const q = req.query.userId ? { userId: req.query.userId } : {};
  const rows = await Reading.find(q).sort({ timestamp:-1 }).limit(200);
  res.json(rows);
});

module.exports = router;
