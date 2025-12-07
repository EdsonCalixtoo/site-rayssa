-- Criar tabela settings para armazenar tokens OAuth Melhor Envio
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  melhor_envio_access_token TEXT,
  melhor_envio_refresh_token TEXT,
  melhor_envio_expires_in INT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir linha inicial
INSERT INTO settings (id) VALUES (gen_random_uuid())
ON CONFLICT (id) DO NOTHING;
