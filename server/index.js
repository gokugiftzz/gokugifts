const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Universal Production CORS Configuration
const corsOptions = {
  origin: '*', // Absolute fix for cross-origin Bearer token requests (No Cookies used)
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const wishlistRoutes = require('./routes/wishlist');
const couponRoutes = require('./routes/coupons');
const uploadRoutes = require('./routes/upload');
const paymentRoutes = require('./routes/payment');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');
const inventoryRoutes = require('./routes/inventory');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'GokuGiftz API is running 🎁', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send('GokuGiftz API Server is successfully running. 🚀');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5005;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 GokuGiftz Server running on port ${PORT}`);
  });
}

// Required for Vercel Serverless deployment
module.exports = app;
