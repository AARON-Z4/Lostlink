const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// ─── Socket.io — Realtime Notifications ───────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Make io available throughout the app
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Client joins their own room using user ID
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║   🔗 LostLink API is running       ║
  ║   Port: ${PORT}                       ║
  ║   Env:  ${(process.env.NODE_ENV || 'development').padEnd(11)}           ║
  ║   DB:   Supabase (ap-south-1)      ║
  ╚════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

module.exports = { server, io };
