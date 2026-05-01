require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const itemsRoutes = require('./routes/items.routes');
const claimsRoutes = require('./routes/claims.routes');
const qrRoutes = require('./routes/qr.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later.' },
});

app.use(limiter);

// ─── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ───────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'LostLink API' });
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/auth', authLimiter, authRoutes);
app.use('/items', itemsRoutes);
app.use('/claims', claimsRoutes);
app.use('/qr', qrRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/admin', adminRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }

  return res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

module.exports = app;
