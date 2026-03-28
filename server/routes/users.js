const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// User profile routes (basic - auth handles most)
router.get('/profile', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
