// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  severity: { type: String, enum: ['low','medium','high'], default: 'medium' },
  status: { type: String, enum: ['open','reviewed','closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  detectedAt: Date,
  stress: Number,
  fatigue: Number,
  sensors: Object,
  note: String
});

module.exports = mongoose.model('Ticket', ticketSchema);
