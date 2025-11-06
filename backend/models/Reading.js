// models/Reading.js
const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  source: { type: String, default: 'web' }, // web | esp32 | miband
  stress: Number,
  fatigue: Number,
  recommendation: String,
  sensors: { // ambient sensor snapshot
    noise_db: Number,
    light: Number,
    temperature: Number,
    humidity: Number,
    hr: Number // heart rate if available
  },
  evidenceUrl: String, // optional link to saved audio/image
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reading', readingSchema);
