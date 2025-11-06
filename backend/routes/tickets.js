// routes/tickets.js
const express = require('express');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/tickets
 * @desc Create a new ticket (stress/fatigue alert or manual report)
 * @access Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { severity, detectedAt, stress, fatigue, sensors, note } = req.body;

    const ticket = new Ticket({
      userId: req.user._id,
      severity: severity || 'medium',
      detectedAt: detectedAt ? new Date(detectedAt) : new Date(),
      stress: stress || 0,
      fatigue: fatigue || 0,
      sensors: sensors || {},
      note: note || '',
      status: 'open',
    });

    await ticket.save();

    // Optional: emit socket.io update to frontend dashboards
    if (req.app.get('io')) {
      req.app.get('io').emit('new_ticket', {
        user: req.user.name,
        ticket,
      });
    }

    res.status(201).json({
      ok: true,
      message: '🚨 Ticket created successfully',
      ticket,
    });
  } catch (err) {
    console.error('❌ Ticket creation error:', err);
    res.status(500).json({ error: 'Could not create ticket' });
  }
});

/**
 * @route GET /api/tickets
 * @desc Get tickets (admins see all, users see their own)
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const tickets = await Ticket.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      ok: true,
      count: tickets.length,
      tickets,
    });
  } catch (err) {
    console.error('❌ Fetch tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

/**
 * @route PATCH /api/tickets/:id
 * @desc Update ticket status (resolve/close)
 * @access Private (owner or admin)
 */
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, note } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Only admin or owner can update
    if (req.user.role !== 'admin' && !ticket.userId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (status) ticket.status = status;
    if (note) ticket.note = note;

    await ticket.save();

    res.json({
      ok: true,
      message: '✅ Ticket updated',
      ticket,
    });
  } catch (err) {
    console.error('❌ Ticket update error:', err);
    res.status(500).json({ error: 'Could not update ticket' });
  }
});

module.exports = router;
