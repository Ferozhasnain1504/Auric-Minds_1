// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// routes
const authRoutes = require('./routes/auth');
const readingsRoutes = require('./routes/readings');
const sensorsRoutes = require('./routes/sensors');
const ticketsRoutes = require('./routes/tickets');
const userRouter = require('./routes/user');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', userRouter);


// connect MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => { console.error('MongoDB connection error', err); process.exit(1); });

app.use('/api/auth', authRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/sensors', sensorsRoutes);
app.use('/api/tickets', ticketsRoutes);

// simple health check
app.get('/api/health', (req, res) => res.json({ ok:true, time: new Date() }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }});
app.set('io', io); // make socket.io available in routes

io.on('connection', socket => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
