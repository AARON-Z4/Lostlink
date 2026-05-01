/**
 * Custom application error class with HTTP status code.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wrap async route handlers to forward errors to Express error middleware.
 * This is a backup — express-async-errors already does this globally.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { AppError, catchAsync };
