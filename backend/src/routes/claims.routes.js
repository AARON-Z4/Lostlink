const express = require('express');
const router = express.Router();
const { createClaim, getClaims, updateClaim, resolveClaim } = require('../controllers/claims.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { claimValidator } = require('../middleware/validation.middleware');

router.post('/', authenticate, claimValidator, createClaim);
router.get('/', authenticate, getClaims);
router.patch('/:id', authenticate, updateClaim);
router.patch('/:id/resolve', authenticate, resolveClaim);

module.exports = router;
