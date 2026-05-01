const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemMatches,
} = require('../controllers/items.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const { itemValidator } = require('../middleware/validation.middleware');

// Public routes
router.get('/', getItems);
router.get('/:id', getItemById);
router.get('/:id/matches', getItemMatches);

// Protected routes
router.post('/lost', authenticate, upload.single('image'), itemValidator, createItem);
router.post('/found', authenticate, upload.single('image'), itemValidator, createItem);
router.patch('/:id', authenticate, upload.single('image'), updateItem);
router.delete('/:id', authenticate, deleteItem);

module.exports = router;
