// models/Reading.js
const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  source: { type: String, default: 'web' }, // web | esp32 | miband | mic
  stress: { type: Number, default: 0 },
  fatigue: { type: Number, default: 0 },
  recommendation: { type: String, default: '' },

  // ML feature output (for optional analytics)
  features: {
    rms: Number,
    zcr: Number,
    avg_pitch: Number,
    mfccs: [Number],
  },

  // Detected emotion from ML
  emotion: { type: String, enum: ['calm', 'tense', 'stressed', null], default: null },

  // Raw sensor snapshot
  sensors: {
    noise_db: Number,
    light: Number,
    temperature: Number,
    humidity: Number,
    hr: Number, // heart rate if available
  },

  evidenceUrl: String, // optional uploaded audio file path
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reading', readingSchema);
