const express = require('express');
const router = express.Router();
const { createQR, getQR } = require('../controllers/qr.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/:itemId', authenticate, createQR);
router.get('/:itemId', getQR); // public — scanned by anyone

module.exports = router;
