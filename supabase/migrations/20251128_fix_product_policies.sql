/*
  # Corrigir políticas de RLS para produtos

  Adiciona políticas mais permissivas para inserção e atualização de produtos
  por usuários autenticados
*/

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Criar novas políticas mais claras
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

-- Manter política de leitura pública
CREATE POLICY IF NOT EXISTS "Anyone can view products"
  ON products FOR SELECT
  USING (true);
