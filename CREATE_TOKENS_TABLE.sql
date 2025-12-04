-- Criar tabela para armazenar tokens OAuth do Melhor Envio
CREATE TABLE IF NOT EXISTS melhor_envio_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Informações do token
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  
  -- Informações do usuário Melhor Envio
  melhor_envio_user_id TEXT NOT NULL UNIQUE,
  melhor_envio_user_email TEXT,
  
  -- Status
  is_valid BOOLEAN DEFAULT true,
  
  -- Para rastreamento
  last_used_at TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_melhor_envio_tokens_user_id ON melhor_envio_tokens(melhor_envio_user_id);
CREATE INDEX IF NOT EXISTS idx_melhor_envio_tokens_is_valid ON melhor_envio_tokens(is_valid);
CREATE INDEX IF NOT EXISTS idx_melhor_envio_tokens_expires_at ON melhor_envio_tokens(expires_at);
