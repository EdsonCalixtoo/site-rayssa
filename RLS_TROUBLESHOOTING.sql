/*
  # Simplificar políticas de RLS para Desenvolvimento

  Para ambiente de desenvolvimento, as políticas de RLS dos produtos
  serão simplificadas para permitir operações básicas de CRUD.
  
  IMPORTANTE: Em produção, revise estas políticas para maior segurança!
*/

-- Verificar políticas existentes
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products'
ORDER BY tablename, policyname;

-- Se houver erros de política, execute isto no dashboard do Supabase:
/*

-- Remover todas as políticas antigas
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;

-- Desabilitar RLS temporariamente para testes
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Ou, reabilitar com políticas permissivas:
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON products FOR SELECT USING (true);

CREATE POLICY "Authenticated create"
  ON products FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update"
  ON products FOR UPDATE 
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete"
  ON products FOR DELETE 
  TO authenticated
  USING (true);

*/
