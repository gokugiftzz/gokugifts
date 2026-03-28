const express = require('express');
const router = express.Router();
const { addReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:productId', getReviews);
router.post('/:productId', protect, addReview);

module.exports = router;
