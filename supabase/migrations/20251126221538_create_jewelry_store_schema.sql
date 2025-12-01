/*
  # Create Jewelry Store Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Product name
      - `description` (text) - Product description
      - `price` (numeric) - Product price
      - `image_url` (text) - Product image URL
      - `category` (text) - Product category (ring, necklace, bracelet, earrings)
      - `stock` (integer) - Available stock
      - `is_featured` (boolean) - Featured on homepage
      - `created_at` (timestamptz) - Creation timestamp
    
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text) - Customer name
      - `email` (text) - Customer email
      - `phone` (text) - Customer phone
      - `address` (text) - Customer address
      - `created_at` (timestamptz) - Creation timestamp
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_id` (uuid) - Foreign key to customers
      - `status` (text) - Order status (pending, processing, completed, cancelled)
      - `total_amount` (numeric) - Total order amount
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid) - Foreign key to orders
      - `product_id` (uuid) - Foreign key to products
      - `quantity` (integer) - Item quantity
      - `price` (numeric) - Price at time of purchase
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Public read access for products
    - Authenticated admin access for orders management
    - Customers can insert their own data
    - Order items inherit order permissions

  3. Important Notes
    - All tables use UUID primary keys
    - Timestamps track record creation and updates
    - Foreign key constraints maintain referential integrity
    - Stock tracking enabled for inventory management
*/

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

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete products"
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