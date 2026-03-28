-- GokuGiftz Database Schema (Supabase PostgreSQL)
-- This script is idempotent (can be run multiple times).

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'vendor')),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  category VARCHAR(100),
  occasion VARCHAR(100),
  relationship_tags TEXT[],
  images TEXT[],
  features TEXT[],
  customizable BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  rating DECIMAL(3, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  same_day_delivery BOOLEAN DEFAULT false,
  vendor_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  items JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  razorpay_payment_id VARCHAR(255),
  subtotal DECIMAL(10, 2),
  discount DECIMAL(10, 2) DEFAULT 0,
  shipping_charge DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number VARCHAR(255),
  gift_message TEXT,
  customizations JSONB,
  same_day_delivery BOOLEAN DEFAULT false,
  coupon_code VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- 6. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL,
  max_discount DECIMAL(10, 2),
  min_order_value DECIMAL(10, 2),
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: We use 'ON CONFLICT DO NOTHING' for seed data to avoid errors if run again.

-- Sample Data: Products
INSERT INTO products (name, description, price, original_price, category, occasion, customizable, stock, rating, review_count, featured, same_day_delivery) 
VALUES
('Personalized LED Photo Cushion', 'Soft and cuddly cushion with a magic LED light that reveals your favorite photo when switched on.', 599.00, 899.00, 'Home Decor', 'Birthday', true, 100, 4.8, 12, true, true),
('Assorted Silk Chocolate Hamper', 'A luxury collection of 12 assorted silk chocolates in a premium heart-shaped box.', 849.00, 1099.00, 'Hampers', 'Anniversary', false, 50, 4.9, 25, true, true),
('Golden Name Personalized Pendant', 'Exquisite 24K gold-plated necklace with a name of your choice.', 1299.00, 1899.00, 'Jewelry', 'Wedding', true, 20, 5.0, 8, true, false),
('Ceramic Plant Pot with Succulent', 'Modern minimalist ceramic pot with a live healthy succulent.', 349.00, 499.00, 'Plants', 'Housewarming', false, 30, 4.7, 15, false, true),
('Customized Leather Wallet & Pen Set', 'Premium brown leather wallet and executive pen set.', 999.00, 1499.00, 'Personalized', 'Anniversary', true, 40, 4.8, 18, true, false),
('Artistic Acrylic Spotify Frame', 'A sleek acrylic plaque with your favorite song''s Spotify code.', 449.00, 649.00, 'Art', 'Birthday', true, 80, 4.9, 32, true, true)
ON CONFLICT DO NOTHING;

-- Sample Data: Coupons
INSERT INTO coupons (code, type, value, max_discount, min_order_value, active, expires_at) 
VALUES
('WELCOME10', 'percentage', 10, 200, 299, true, '2027-12-31'),
('GIFT50', 'fixed', 50, NULL, 499, true, '2027-12-31'),
('GOKU20', 'percentage', 20, 500, 999, true, '2027-12-31')
ON CONFLICT DO NOTHING;
