/*
  # Adicionar informações de envio e pagamento

  1. Alterações nas Tabelas
    - `products`
      - Adicionar `weight` (peso em gramas)
      - Adicionar `height` (altura em cm)
      - Adicionar `width` (largura em cm)
      - Adicionar `length` (comprimento em cm)
    
    - `customers`
      - Adicionar `user_id` (referência ao auth.users)
      - Adicionar `zip_code` (CEP)
      - Adicionar `city` (cidade)
      - Adicionar `state` (estado)
    
    - `orders`
      - Adicionar `payment_method` (método de pagamento: pix ou credit_card)
      - Adicionar `shipping_cost` (custo do frete)
      - Adicionar `zip_code` (CEP de entrega)
      - Adicionar `city` (cidade de entrega)
      - Adicionar `state` (estado de entrega)
      - Adicionar `tracking_code` (código de rastreio)

  2. Segurança
    - Habilitar RLS na tabela customers
    - Adicionar políticas para clientes visualizarem apenas seus próprios dados
*/

-- Adicionar colunas de dimensões aos produtos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'weight'
  ) THEN
    ALTER TABLE products ADD COLUMN weight INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'height'
  ) THEN
    ALTER TABLE products ADD COLUMN height INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'width'
  ) THEN
    ALTER TABLE products ADD COLUMN width INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'length'
  ) THEN
    ALTER TABLE products ADD COLUMN length INTEGER DEFAULT 0;
  END IF;
END $$;

-- Adicionar colunas aos customers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE customers ADD COLUMN zip_code TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'city'
  ) THEN
    ALTER TABLE customers ADD COLUMN city TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'state'
  ) THEN
    ALTER TABLE customers ADD COLUMN state TEXT DEFAULT '';
  END IF;
END $$;

-- Adicionar colunas aos orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'pix';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_cost'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_cost NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN zip_code TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'city'
  ) THEN
    ALTER TABLE orders ADD COLUMN city TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'state'
  ) THEN
    ALTER TABLE orders ADD COLUMN state TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_code TEXT DEFAULT '';
  END IF;
END $$;

-- RLS para customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Clientes podem ver seus próprios dados
CREATE POLICY "Users can view own customer data"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Clientes podem criar seu próprio perfil
CREATE POLICY "Users can create own customer profile"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Clientes podem atualizar seus próprios dados
CREATE POLICY "Users can update own customer data"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin pode ver todos os clientes (para service_role)
CREATE POLICY "Service role can manage all customers"
  ON customers
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS para orders - clientes podem ver seus próprios pedidos
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = orders.customer_id
      AND customers.user_id = auth.uid()
    )
  );