const { body, param, query, validationResult } = require('express-validator');

// Middleware to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth validators
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Item validators
const itemValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('type').optional().isIn(['lost', 'found']).withMessage('Type must be lost or found'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').isISO8601().withMessage('Valid date required (ISO8601)'),
  validate,
];

// Claim validators
const claimValidator = [
  body('item_id').isUUID().withMessage('Valid item ID required'),
  body('message').optional().trim(),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  itemValidator,
  claimValidator,
};
