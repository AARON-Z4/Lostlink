const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, refreshToken } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { registerValidator, loginValidator } = require('../middleware/validation.middleware');

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/refresh', refreshToken);

module.exports = router;
