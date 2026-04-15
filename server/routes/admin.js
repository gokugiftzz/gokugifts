const express = require('express');
const router = express.Router();
const { getAnalytics, getAllUsers, updateUserRole, deleteAllProducts, deleteUser, deleteOrder } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.delete('/orders/:id', protect, adminOnly, deleteOrder);
router.delete('/products/all', protect, adminOnly, deleteAllProducts);

module.exports = router;
