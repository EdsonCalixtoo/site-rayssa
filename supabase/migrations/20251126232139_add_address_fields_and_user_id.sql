/*
  # Adicionar campos de endereço e user_id

  1. Alterações na tabela `customers`
    - Adicionar `user_id` (uuid) - Relacionamento com auth.users
    - Adicionar `number` (text) - Número da residência
    - Adicionar `complement` (text) - Complemento do endereço
    - Adicionar `zip_code` (text) - CEP
    - Adicionar `city` (text) - Cidade
    - Adicionar `state` (text) - Estado

  2. Alterações na tabela `orders`
    - Adicionar `payment_method` (text) - Método de pagamento
    - Adicionar `shipping_cost` (numeric) - Custo de envio
    - Adicionar `zip_code` (text) - CEP de entrega
    - Adicionar `city` (text) - Cidade de entrega
    - Adicionar `state` (text) - Estado de entrega
    - Adicionar `tracking_code` (text) - Código de rastreio

  3. Security
    - Adicionar políticas para clientes visualizarem seus próprios dados
    - Clientes autenticados podem ver apenas seus próprios pedidos

  4. Important Notes
    - Os campos adicionais permitem endereços completos
    - user_id permite associar cliente com conta de autenticação
    - Separação de área do cliente e dashboard admin
*/

-- Adicionar campos à tabela customers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'number'
  ) THEN
    ALTER TABLE customers ADD COLUMN number text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'complement'
  ) THEN
    ALTER TABLE customers ADD COLUMN complement text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE customers ADD COLUMN zip_code text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'city'
  ) THEN
    ALTER TABLE customers ADD COLUMN city text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'state'
  ) THEN
    ALTER TABLE customers ADD COLUMN state text DEFAULT '';
  END IF;
END $$;

-- Adicionar campos à tabela orders (verificar se já existem)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT 'pix';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_cost'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_cost numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN zip_code text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'city'
  ) THEN
    ALTER TABLE orders ADD COLUMN city text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'state'
  ) THEN
    ALTER TABLE orders ADD COLUMN state text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_code text DEFAULT '';
  END IF;
END $$;

-- Adicionar política para clientes visualizarem seus próprios dados
DROP POLICY IF EXISTS "Customers can view their own data" ON customers;
CREATE POLICY "Customers can view their own data"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Adicionar política para clientes visualizarem seus próprios pedidos
DROP POLICY IF EXISTS "Customers can view their own orders" ON orders;
CREATE POLICY "Customers can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

-- Adicionar política para clientes visualizarem items de seus próprios pedidos
DROP POLICY IF EXISTS "Customers can view their own order items" ON order_items;
CREATE POLICY "Customers can view their own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      INNER JOIN customers c ON c.id = o.customer_id
      WHERE c.user_id = auth.uid()
    )
  );