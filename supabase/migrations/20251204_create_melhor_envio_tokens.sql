-- Tabela para armazenar tokens OAuth do Melhor Envio
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
CREATE INDEX idx_melhor_envio_tokens_user_id ON melhor_envio_tokens(melhor_envio_user_id);
CREATE INDEX idx_melhor_envio_tokens_is_valid ON melhor_envio_tokens(is_valid);
CREATE INDEX idx_melhor_envio_tokens_expires_at ON melhor_envio_tokens(expires_at);

-- Comentários
COMMENT ON TABLE melhor_envio_tokens IS 'Armazena tokens OAuth do Melhor Envio para cálculo de fretes';
COMMENT ON COLUMN melhor_envio_tokens.access_token IS 'Token de acesso obtido via OAuth';
COMMENT ON COLUMN melhor_envio_tokens.refresh_token IS 'Token de renovação (válido por 30 dias)';
COMMENT ON COLUMN melhor_envio_tokens.expires_at IS 'Data e hora de expiração do access_token (30 dias)';
