-- ============================================
-- RT PRATAS - Migrações Completas
-- Execute este arquivo no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Create Jewelry Store Schema
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  image_url text NOT NULL,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
DROP POLICY IF EXISTS "Anyone can insert customers" ON customers;
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO products (name, description, price, image_url, category, stock, is_featured) VALUES
  ('Anel de Diamante Solitário', 'Elegante anel de ouro 18k com diamante central de 0.5 quilates', 8500.00, 'https://images.pexels.com/photos/1232931/pexels-photo-1232931.jpeg', 'ring', 5, true),
  ('Colar de Pérolas', 'Luxuoso colar com pérolas naturais e fecho de ouro branco', 12000.00, 'https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg', 'necklace', 8, true),
  ('Brincos de Esmeralda', 'Sofisticados brincos com esmeraldas colombianas e diamantes', 15500.00, 'https://images.pexels.com/photos/1406961/pexels-photo-1406961.jpeg', 'earrings', 4, true),
  ('Pulseira de Ouro', 'Pulseira em ouro amarelo 18k com design trançado', 4200.00, 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg', 'bracelet', 10, false),
  ('Anel de Safira', 'Anel vintage com safira azul e detalhes em diamantes', 9800.00, 'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg', 'ring', 3, true),
  ('Colar de Diamantes', 'Riviera de diamantes em ouro branco 18k', 28000.00, 'https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg', 'necklace', 2, false);

-- ============================================
-- 2. Add Product Shipping and Payment Info
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 0.1,
ADD COLUMN IF NOT EXISTS height numeric DEFAULT 10,
ADD COLUMN IF NOT EXISTS width numeric DEFAULT 10,
ADD COLUMN IF NOT EXISTS length numeric DEFAULT 10;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'pix',
ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS tracking_code text UNIQUE;

-- ============================================
-- 3. Add Address Fields and User ID
-- ============================================
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS number text,
ADD COLUMN IF NOT EXISTS complement text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;

-- ============================================
-- 4. Add Payment Installments Info
-- ============================================
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS installments integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS installment_amount numeric DEFAULT 0;

-- ============================================
-- 5. Fix Product Policies
-- ============================================
-- Policies já foram criadas/atualizadas na seção anterior

-- ============================================
-- 6. Create Shipping Config Table
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  melhor_envio_token text,
  melhor_envio_contract text,
  enabled boolean DEFAULT false
);

ALTER TABLE shipping_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only authenticated users can access shipping config" ON shipping_config;

CREATE POLICY "Only authenticated users can access shipping config"
  ON shipping_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 7. Add Images Column
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE products SET images = ARRAY[image_url] WHERE image_url IS NOT NULL;

-- ============================================
-- 8. Add Melhor Envio Shipping Integration
-- ============================================
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS melhor_envio_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
ADD COLUMN IF NOT EXISTS shipping_deadline INTEGER,
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

CREATE TABLE IF NOT EXISTS shipping_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  status_description TEXT,
  status_date timestamptz DEFAULT now(),
  carrier TEXT,
  location TEXT,
  tracking_number TEXT,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all shipping logs" ON shipping_logs;
DROP POLICY IF EXISTS "Anyone can create shipping logs" ON shipping_logs;

CREATE POLICY "Admins can view all shipping logs"
  ON shipping_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create shipping logs"
  ON shipping_logs FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_melhor_envio_id ON orders(melhor_envio_id);
CREATE INDEX IF NOT EXISTS idx_shipping_logs_order_id ON shipping_logs(order_id);

-- ============================================
-- Migrações Completas!
-- ============================================
-- Tabelas criadas:
-- - products
-- - customers
-- - orders
-- - order_items
-- - shipping_config
-- - shipping_logs
-- ============================================
