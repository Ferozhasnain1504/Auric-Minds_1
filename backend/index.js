// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const audioRoutes = require("./routes/audio");
const path = require('path');


// routes
const authRoutes = require('./routes/auth');
const readingsRoutes = require('./routes/readings');
const sensorsRoutes = require('./routes/sensors');
const ticketsRoutes = require('./routes/tickets');
const userRouter = require('./routes/user');
const audioRoute = require("./routes/audio");

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// --- Routes ---
app.use('/api/users', userRouter);
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/sensors', sensorsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use("/api/audio", audioRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI missing in .env");
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// --- Health Check ---
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date(), ml: process.env.ML_SERVICE_URL || 'not set' }));

// --- Socket.io Setup ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }});
app.set('io', io); // make socket.io available in routes

io.on('connection', socket => {
  console.log('🟢 Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('🔴 Socket disconnected:', socket.id));
});

// --- Global Error Handling (Optional) ---
app.use((err, req, res, next) => {
  console.error("💥 Unexpected error:", err);
  res.status(500).json({ error: err.message || 'Server error' });
});

// --- Start Server ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
