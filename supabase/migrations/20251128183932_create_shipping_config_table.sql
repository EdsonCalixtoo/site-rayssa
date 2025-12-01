/*
  # Criar tabela de configuração de frete
  
  1. New Tables
    - `shipping_config`
      - `id` (primary key)
      - `client_id` (Client ID do Melhor Envio)
      - `client_secret` (Client Secret do Melhor Envio)
      - `token` (Token de acesso da aplicação)
      - `is_production` (boolean para prod/sandbox)
      - `enabled_carriers` (array de transportadoras ativas)
      - `updated_at` (timestamp)
  
  2. Security
    - Habilitar RLS
    - Apenas admin pode ler/escrever
    - Usar service_role para leitura segura
  
  3. Notes
    - Sensitive data (tokens) must be protected
    - Only one configuration record needed
*/

CREATE TABLE IF NOT EXISTS shipping_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL DEFAULT '',
  client_secret TEXT NOT NULL DEFAULT '',
  token TEXT NOT NULL DEFAULT '',
  is_production BOOLEAN DEFAULT false,
  enabled_carriers TEXT[] DEFAULT ARRAY['jadlog', 'correios', 'azul_cargo'],
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE shipping_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage shipping config"
  ON shipping_config
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users cannot directly access"
  ON shipping_config
  FOR SELECT
  TO authenticated
  USING (false);

INSERT INTO shipping_config (id, client_id) VALUES ('00000000-0000-0000-0000-000000000001', '') ON CONFLICT DO NOTHING;