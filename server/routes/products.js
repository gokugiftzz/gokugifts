const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getFeatured, getCategories
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, upload.any(), createProduct);
router.put('/:id', protect, adminOnly, upload.any(), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
