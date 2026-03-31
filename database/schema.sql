-- GokuGiftz Unified Database Schema (Supabase PostgreSQL)
-- This script is idempotent (can be run multiple times).

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'vendor')),
  avatar TEXT,
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10, 2) CHECK (original_price >= 0),
  category VARCHAR(100),
  occasion VARCHAR(100),
  relationship_tags TEXT[],
  images JSONB,
  features TEXT[],
  details TEXT,
  product_code VARCHAR(50) UNIQUE,
  gift_type VARCHAR(50) DEFAULT 'Standard',
  personalization_options JSONB,
  customizable BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  rating DECIMAL(3, 1) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  featured BOOLEAN DEFAULT false,
  vendor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_occasion ON products(occasion);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code VARCHAR(50) UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  items JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  razorpay_payment_id VARCHAR(255),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount DECIMAL(10, 2) DEFAULT 0 CHECK (discount >= 0),
  shipping_charge DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_charge >= 0),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number VARCHAR(255),
  estimated_delivery DATE,
  history JSONB DEFAULT '[]'::jsonb,
  gift_message TEXT,
  customizations JSONB,
  coupon_code VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 4. Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- 6. Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  discount_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  description TEXT,
  features TEXT[],
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, variant_name)
);

CREATE INDEX IF NOT EXISTS idx_variant_product_id ON product_variants(product_id);

-- 7. Inventory Pool Table
CREATE TABLE IF NOT EXISTS inventory_pool (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code VARCHAR(50) UNIQUE NOT NULL,
  product_name VARCHAR(255),
  is_used BOOLEAN DEFAULT false,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_pool_used ON inventory_pool(is_used);

-- 8. Admin Activity Logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100),
  target_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_activity_logs(created_at);

-- SAFE MIGRATIONS (Column check/add)
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code VARCHAR(50) UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gift_type VARCHAR(50) DEFAULT 'Standard';
ALTER TABLE products ADD COLUMN IF NOT EXISTS personalization_options JSONB;

DO $$ 
BEGIN 
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') = 'ARRAY' THEN
        ALTER TABLE products ALTER COLUMN images TYPE JSONB USING to_jsonb(images);
    END IF;
END $$;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code VARCHAR(50) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;
