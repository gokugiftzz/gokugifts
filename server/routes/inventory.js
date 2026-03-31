const express = require('express');
const router = express.Router();
const { getInventory, importBulk, updateId } = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getInventory);
router.post('/bulk', protect, admin, importBulk);
router.put('/:id', protect, admin, updateId);

module.exports = router;
