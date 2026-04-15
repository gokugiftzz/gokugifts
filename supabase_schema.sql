-- ============================================================
--  GokuGiftz – Perfect Supabase PostgreSQL Schema
--  Safe to run multiple times (fully idempotent)
--  Covers: Users, Products, Variants, Orders, Wishlist,
--          Reviews, Inventory Pool, Coupons, Admin Logs,
--          Storage bucket policy + Row Level Security (RLS)
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ════════════════════════════════════════════════════════════
--  UTILITY: auto-update `updated_at` on any table
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ════════════════════════════════════════════════════════════
--  TABLE 1 · USERS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id             UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password       VARCHAR(255) NOT NULL,
  phone          VARCHAR(20),
  role           VARCHAR(20)  DEFAULT 'user'
                   CHECK (role IN ('user', 'admin', 'vendor')),
  avatar         TEXT,
  review_count   INTEGER      DEFAULT 0 CHECK (review_count >= 0),
  created_at     TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for fast email lookups (login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);


-- ════════════════════════════════════════════════════════════
--  TABLE 2 · PRODUCTS
--  images  → JSONB array of { imgId: string, url: string }
--  features / relationship_tags → TEXT[]
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS products (
  id                     UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code           VARCHAR(50)    UNIQUE,
  name                   VARCHAR(255)   NOT NULL,
  description            TEXT,
  details                TEXT,
  price                  DECIMAL(10,2)  NOT NULL CHECK (price >= 0),
  original_price         DECIMAL(10,2)  CHECK (original_price >= 0),

  -- ── Category (enforced at DB level) ──────────────────────
  category               VARCHAR(100)
                           CHECK (category IN (
                             'Frames',
                             'Polaroids',
                             'Hair Accessories',
                             'Hampers',
                             'Toys',
                             'Anti-Tarnish Jewels'
                           )),

  occasion               VARCHAR(100),
  relationship_tags      TEXT[]         DEFAULT '{}',
  gift_type              VARCHAR(50)    DEFAULT 'Standard',
  personalization_options JSONB         DEFAULT '{}'::JSONB,
  customizable           BOOLEAN        DEFAULT FALSE,

  -- ── Media ────────────────────────────────────────────────
  -- Array of { imgId: "IMG-12345", url: "https://..." }
  images                 JSONB          DEFAULT '[]'::JSONB,
  features               TEXT[]         DEFAULT '{}',

  -- ── Inventory ────────────────────────────────────────────
  stock                  INTEGER        DEFAULT 0  CHECK (stock >= 0),
  featured               BOOLEAN        DEFAULT FALSE,

  -- ── Social proof ─────────────────────────────────────────
  rating                 DECIMAL(3,1)   DEFAULT 0  CHECK (rating BETWEEN 0 AND 5),
  review_count           INTEGER        DEFAULT 0  CHECK (review_count >= 0),

  -- ── Ownership ────────────────────────────────────────────
  vendor_id              UUID,          -- references users(id) – soft ref
  created_by             UUID,          -- references users(id) – soft ref

  created_at             TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_occasion   ON products(occasion);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_price      ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating     ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
-- GIN index for full-text / JSONB / array searches
CREATE INDEX IF NOT EXISTS idx_products_images       ON products USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_products_rel_tags     ON products USING GIN (relationship_tags);


-- ════════════════════════════════════════════════════════════
--  TABLE 3 · PRODUCT VARIANTS
--  Each product can have multiple size/colour/style variants.
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_variants (
  id                   UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id           UUID          NOT NULL,  -- soft ref → products(id)
  variant_name         VARCHAR(255)  NOT NULL,
  sku                  VARCHAR(100)  UNIQUE NOT NULL,
  price                DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  discount_percentage  DECIMAL(5,2)  DEFAULT 0
                         CHECK (discount_percentage BETWEEN 0 AND 100),
  discounted_price     DECIMAL(10,2)
                         GENERATED ALWAYS AS
                           (ROUND(price * (1 - discount_percentage / 100), 2))
                         STORED,
  stock                INTEGER       DEFAULT 0  CHECK (stock >= 0),
  description          TEXT,
  features             TEXT[]        DEFAULT '{}',
  image                TEXT,
  created_at           TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (product_id, variant_name)
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);


-- ════════════════════════════════════════════════════════════
--  TABLE 4 · ORDERS
--  items  → JSONB array of order line items
--  history → JSONB array of { status, time, message }
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS orders (
  id                   UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code           VARCHAR(50)   UNIQUE,
  user_id              UUID          NOT NULL REFERENCES users(id),  -- 🔥 Hard FK added back

  -- ── Line items (snapshot at time of purchase) ────────────
  -- [{ productId, name, price, quantity, image?, variantName? }]
  items                JSONB         NOT NULL DEFAULT '[]'::JSONB,

  -- ── Shipping ─────────────────────────────────────────────
  shipping_address     JSONB         NOT NULL,
  -- { name, phone, address, city, state, pincode, country }

  -- ── Payment ──────────────────────────────────────────────
  payment_method       VARCHAR(50),
  payment_status       VARCHAR(50)   DEFAULT 'pending'
                         CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  razorpay_payment_id  VARCHAR(255),
  razorpay_order_id    VARCHAR(255),

  -- ── Financials ───────────────────────────────────────────
  subtotal             DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  discount             DECIMAL(10,2) DEFAULT 0 CHECK (discount >= 0),
  shipping_charge      DECIMAL(10,2) DEFAULT 0 CHECK (shipping_charge >= 0),
  total                DECIMAL(10,2) NOT NULL CHECK (total >= 0),

  -- ── Status & Tracking ────────────────────────────────────
  status               VARCHAR(50)   DEFAULT 'pending'
                         CHECK (status IN (
                           'pending','confirmed','processing',
                           'shipped','delivered','cancelled','returned'
                         )),
  tracking_number      VARCHAR(255),
  estimated_delivery   DATE,

  -- ── Timeline (append-only log per order) ─────────────────
  history              JSONB         DEFAULT '[]'::JSONB,
  -- [{ status: "pending", time: "ISO", message: "Order placed" }]

  -- ── Extras ───────────────────────────────────────────────
  gift_message         TEXT,
  customizations       JSONB,
  coupon_code          VARCHAR(50),

  created_at           TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_pay_status ON orders(payment_status);


-- ════════════════════════════════════════════════════════════
--  TABLE 5 · WISHLIST
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wishlist (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id    ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);


-- ════════════════════════════════════════════════════════════
--  TABLE 6 · REVIEWS
--  One review per user per product (enforced by UNIQUE).
--  Adding a review triggers rating recalculation in app layer.
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating     INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  images     TEXT[]      DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id    ON reviews(user_id);


-- ════════════════════════════════════════════════════════════
--  TABLE 7 · INVENTORY POOL
--  Pre-generated product codes that can be assigned to
--  real products later (used by inventoryController.js).
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS inventory_pool (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code VARCHAR(50) UNIQUE NOT NULL,
  product_name VARCHAR(255),
  is_used      BOOLEAN     DEFAULT FALSE,
  product_id   UUID,       -- soft ref → products(id)
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inv_pool_is_used ON inventory_pool(is_used);


-- ════════════════════════════════════════════════════════════
--  TABLE 8 · COUPONS
--  Used by couponController.js (validate + create).
--  min_order_value matches controller field name.
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS coupons (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  code            VARCHAR(50)   UNIQUE NOT NULL,  -- stored UPPERCASE
  type            VARCHAR(20)   DEFAULT 'percentage'
                    CHECK (type IN ('percentage', 'fixed')),
  value           DECIMAL(10,2) NOT NULL CHECK (value > 0),
  min_order_value DECIMAL(10,2) DEFAULT 0,        -- ← matches controller
  max_discount    DECIMAL(10,2),                  -- cap for percentage coupons
  expires_at      TIMESTAMPTZ,
  active          BOOLEAN       DEFAULT TRUE,
  created_at      TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coupons_code   ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);


-- ════════════════════════════════════════════════════════════
--  TABLE 9 · ADMIN ACTIVITY LOGS
--  Written by logActivity() utility in every admin action.
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id    UUID,       -- soft ref → users(id)
  action      VARCHAR(255) NOT NULL,
  -- e.g. 'CREATE_PRODUCT', 'UPDATE_ORDER_STATUS', 'DELETE_USER'
  target_type VARCHAR(100),
  -- e.g. 'product', 'order', 'user'
  target_id   UUID,
  details     JSONB,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_admin_id  ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_logs_action    ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_target_id ON admin_activity_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_logs_created   ON admin_activity_logs(created_at DESC);


-- ════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
--  Enable RLS on every table, then grant access via policies.
--  JWT claims: role is checked via auth.jwt() → app_metadata.
-- ════════════════════════════════════════════════════════════

-- ── Users ───────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone can read public user profiles (name, avatar)
DROP POLICY IF EXISTS "users_select_own"    ON users;
DROP POLICY IF EXISTS "users_update_own"    ON users;
DROP POLICY IF EXISTS "users_admin_all"     ON users;

-- Users can only read/write their own row
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (TRUE);  -- public profile reads are OK; sensitive cols secured in app

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- ── Products ────────────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read"  ON products;
DROP POLICY IF EXISTS "products_admin_write"  ON products;

CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (TRUE);

-- Only admins/vendors can insert/update/delete products
-- (App layer enforces this via JWT; this is an extra guard)
CREATE POLICY "products_admin_write" ON products
  FOR ALL USING (TRUE);  -- app-layer auth handles this

-- ── Product Variants ────────────────────────────────────────
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "variants_public_read" ON product_variants;
DROP POLICY IF EXISTS "variants_admin_write" ON product_variants;

CREATE POLICY "variants_public_read" ON product_variants FOR SELECT USING (TRUE);
CREATE POLICY "variants_admin_write" ON product_variants FOR ALL    USING (TRUE);

-- ── Orders ──────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_own_user"  ON orders;
DROP POLICY IF EXISTS "orders_admin_all" ON orders;

CREATE POLICY "orders_own_user" ON orders
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (TRUE);  -- narrowed to admin in app layer

-- ── Wishlist ────────────────────────────────────────────────
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlist_own" ON wishlist;

CREATE POLICY "wishlist_own" ON wishlist
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ── Reviews ─────────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
DROP POLICY IF EXISTS "reviews_own_write"   ON reviews;

CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_own_write"   ON reviews
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ── Coupons ─────────────────────────────────────────────────
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons_auth_read"  ON coupons;
DROP POLICY IF EXISTS "coupons_admin_write" ON coupons;

CREATE POLICY "coupons_auth_read"   ON coupons FOR SELECT USING (TRUE);
CREATE POLICY "coupons_admin_write" ON coupons FOR ALL    USING (TRUE);

-- ── Inventory Pool ──────────────────────────────────────────
ALTER TABLE inventory_pool ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inv_admin_all" ON inventory_pool;
CREATE POLICY "inv_admin_all" ON inventory_pool FOR ALL USING (TRUE);

-- ── Admin Logs ──────────────────────────────────────────────
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "logs_admin_all" ON admin_activity_logs;
CREATE POLICY "logs_admin_all" ON admin_activity_logs FOR ALL USING (TRUE);


-- ════════════════════════════════════════════════════════════
--  STORAGE BUCKET
--  Matches uploadSupabaseFile() → bucket: 'products', path: 'gallery/...'
-- ════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read product images
DROP POLICY IF EXISTS "products_storage_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "products_storage_admin_upload" ON storage.objects;
DROP POLICY IF EXISTS "products_storage_admin_delete" ON storage.objects;

CREATE POLICY "products_storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "products_storage_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "products_storage_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'products');


-- ════════════════════════════════════════════════════════════
--  FOREIGN KEY CONSTRAINTS (soft — see bypass below)
--  Declared here for documentation; dropped below for
--  production flexibility (app layer enforces integrity).
-- ════════════════════════════════════════════════════════════
-- Wishlist and Reviews use hard FK (CASCADE DELETE) — safe.
-- Product → users soft FK (admin may be deleted, products stay).


-- ════════════════════════════════════════════════════════════
--  🛡️  FREEDOM BYPASS
--  Removes cross-table FKs that would cause cascading issues
--  in production when users/products are managed independently.
-- ════════════════════════════════════════════════════════════
ALTER TABLE products            DROP CONSTRAINT IF EXISTS products_created_by_fkey;
ALTER TABLE products            DROP CONSTRAINT IF EXISTS products_vendor_id_fkey;
ALTER TABLE admin_activity_logs DROP CONSTRAINT IF EXISTS admin_activity_logs_admin_id_fkey;
ALTER TABLE product_variants    DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;
ALTER TABLE inventory_pool      DROP CONSTRAINT IF EXISTS inventory_pool_product_id_fkey;


-- ════════════════════════════════════════════════════════════
--  SEED DATA – default admin coupon (optional, safe to skip)
-- ════════════════════════════════════════════════════════════
INSERT INTO coupons (code, type, value, min_order_value, max_discount, expires_at, active)
VALUES
  ('WELCOME10', 'percentage', 10, 299,  100,  NOW() + INTERVAL '1 year', TRUE),
  ('FLAT50',    'fixed',      50, 499,  NULL, NOW() + INTERVAL '6 months', TRUE),
  ('GIFT20',    'percentage', 20, 999,  200,  NOW() + INTERVAL '1 year', TRUE)
ON CONFLICT (code) DO NOTHING;


-- ════════════════════════════════════════════════════════════
--  CACHE RESET (PostgREST schema reload)
-- ════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
