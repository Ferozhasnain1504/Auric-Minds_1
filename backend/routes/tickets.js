// routes/tickets.js
const express = require('express');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');

const router = express.Router();

// create ticket (open)
router.post('/', auth, async (req, res) => {
  try {
    const { severity, detectedAt, stress, fatigue, sensors, note } = req.body;
    const ticket = new Ticket({
      userId: req.user._id,
      severity: severity || 'medium',
      detectedAt: detectedAt ? new Date(detectedAt) : new Date(),
      stress, fatigue, sensors, note
    });
    await ticket.save();
    res.json({ ok:true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'could not create ticket' });
  }
});

// list tickets (admin or user's own)
router.get('/', auth, async (req, res) => {
  const q = req.user.role === 'admin' ? {} : { userId: req.user._id };
  const tickets = await Ticket.find(q).sort({ createdAt:-1 }).limit(200);
  res.json(tickets);
});

// update status
router.patch('/:id', auth, async (req, res) => {
  const { status } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'not found' });
  // only admin or owner can update; simple rule:
  if (req.user.role !== 'admin' && !ticket.userId.equals(req.user._id)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  ticket.status = status || ticket.status;
  await ticket.save();
  res.json({ ok:true, ticket });
});

module.exports = router;
