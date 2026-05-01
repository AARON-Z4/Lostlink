/**
 * Emit a realtime notification to a specific user's socket room.
 * Call this after saving the DB notification for live push.
 *
 * Usage:
 *   const { emitNotification } = require('../utils/socket');
 *   emitNotification(req.app, userId, { type, message });
 */
const emitNotification = (app, userId, payload) => {
  try {
    const io = app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('notification', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};

/**
 * Emit a match event to a user's room.
 */
const emitMatch = (app, userId, matchData) => {
  try {
    const io = app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('match_found', {
        ...matchData,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};

module.exports = { emitNotification, emitMatch };
