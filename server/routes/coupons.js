const express = require('express');
const router = express.Router();
const { validateCoupon, createCoupon, getAllCoupons } = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/validate', protect, validateCoupon);
router.get('/', protect, adminOnly, getAllCoupons);
router.post('/', protect, adminOnly, createCoupon);

module.exports = router;
