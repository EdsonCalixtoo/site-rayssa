-- Criar tabela products se não existir
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  image_url text NOT NULL,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_featured boolean DEFAULT false,
  weight INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  width INTEGER DEFAULT 0,
  length INTEGER DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela customers se não existir
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  address text NOT NULL,
  number text DEFAULT '',
  complement text DEFAULT '',
  zip_code text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Criar tabela orders se não existir
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  payment_method text DEFAULT 'pix',
  payment_status text DEFAULT 'pending',
  installments integer DEFAULT 1,
  installment_amount numeric DEFAULT 0,
  paid_at timestamptz,
  shipping_cost numeric DEFAULT 0,
  zip_code text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  tracking_code text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela order_items se não existir
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
DROP POLICY IF EXISTS "Public read access" ON products;
DROP POLICY IF EXISTS "Authenticated create" ON products;
DROP POLICY IF EXISTS "Authenticated update" ON products;
DROP POLICY IF EXISTS "Authenticated delete" ON products;

-- Criar novas políticas permissivas
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para customers
CREATE POLICY "Anyone can insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para orders
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

-- Políticas para order_items
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

-- Inserir dados de exemplo
INSERT INTO products (name, description, price, image_url, category, stock, is_featured) VALUES
  ('Anel de Diamante Solitário', 'Elegante anel de ouro 18k com diamante central de 0.5 quilates', 8500.00, 'https://images.pexels.com/photos/1232931/pexels-photo-1232931.jpeg', 'ring', 5, true),
  ('Colar de Pérolas', 'Luxuoso colar com pérolas naturais e fecho de ouro branco', 12000.00, 'https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg', 'necklace', 8, true),
  ('Brincos de Esmeralda', 'Sofisticados brincos com esmeraldas colombianas e diamantes', 15500.00, 'https://images.pexels.com/photos/1406961/pexels-photo-1406961.jpeg', 'earrings', 4, true),
  ('Pulseira de Ouro', 'Pulseira em ouro amarelo 18k com design trançado', 4200.00, 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg', 'bracelet', 10, false),
  ('Anel de Safira', 'Anel vintage com safira azul e detalhes em diamantes', 9800.00, 'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg', 'ring', 3, true),
  ('Colar de Diamantes', 'Riviera de diamantes em ouro branco 18k', 28000.00, 'https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg', 'necklace', 2, false)
ON CONFLICT DO NOTHING;
