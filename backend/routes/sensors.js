// routes/sensors.js
const express = require('express');
const Reading = require('../models/Reading');
const router = express.Router();

// simple endpoint to accept sensor JSON and broadcast
router.post('/', express.json(), async (req, res) => {
  try {
    const { noise_db, light, temperature, humidity, hr, source, userId } = req.body;
    const sensors = { noise_db, light, temperature, humidity, hr };
    // create a lightweight reading without audio if desired (or just broadcast)
    const reading = new Reading({
      userId: userId || null,
      source: source || 'esp32',
      sensors,
      timestamp: new Date()
    });
    await reading.save();
    if (req.app.get('io')) req.app.get('io').emit('sensor_update', { reading });
    res.json({ ok:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
