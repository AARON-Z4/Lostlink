const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserRole,
  deleteUser,
  getItems,
  deleteItem,
  getClaims,
  updateClaim,
  getStats,
} = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// All admin routes require authentication + admin role
router.use(authenticate, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/items', getItems);
router.delete('/items/:id', deleteItem);
router.get('/claims', getClaims);
router.patch('/claims/:id', updateClaim);

module.exports = router;
