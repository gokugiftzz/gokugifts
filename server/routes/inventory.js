const express = require('express');
const router = express.Router();
const { getInventory, importBulk, updateId } = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getInventory);
router.post('/bulk', protect, adminOnly, importBulk);
router.put('/:id', protect, adminOnly, updateId);

module.exports = router;
