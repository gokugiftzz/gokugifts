const express = require('express');
const router = express.Router();
const { getRecommendations, chat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/recommend', getRecommendations);
router.post('/chat', chat);

module.exports = router;
