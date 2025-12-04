# Arquitetura OAuth 2.0 - Melhor Envio

## 🏗️ Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTE (Navegador)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Clica "Conectar Melhor Envio"                               │
│     ↓                                                            │
│  2. Redireciona para:                                           │
│     https://sandbox.melhorenvio.com.br/oauth/authorize         │
│     ?client_id=XXXX&redirect_uri=CALLBACK&scope=XXX            │
│     ↓                                                            │
│  3. Usuário autoriza permissões no site Melhor Envio           │
│     ↓                                                            │
│  4. Melhor Envio redireciona de volta com CODE                 │
│     https://...supabase.co/functions/v1/melhor-envio-callback  │
│     ?code=AUTHORIZATION_CODE&state=XXX                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         SUPABASE EDGE FUNCTION (melhor-envio-callback)           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  5. Recebe CODE na query string                                │
│     ↓                                                            │
│  6. Faz POST para Melhor Envio:                                │
│     https://sandbox.melhorenvio.com.br/oauth/token             │
│     {                                                           │
│       grant_type: "authorization_code",                        │
│       client_id: CLIENT_ID,                                    │
│       client_secret: CLIENT_SECRET,  ← Seguro no servidor     │
│       redirect_uri: CALLBACK,                                  │
│       code: CODE                                               │
│     }                                                           │
│     ↓                                                            │
│  7. Recebe tokens:                                             │
│     {                                                           │
│       access_token: "TOKEN_VALIDO_30_DIAS",                   │
│       refresh_token: "TOKEN_RENOVACAO",                        │
│       expires_in: 2592000                                      │
│     }                                                           │
│     ↓                                                            │
│  8. Obtém dados do usuário:                                   │
│     GET https://sandbox.melhorenvio.com.br/api/v2/me          │
│     Authorization: Bearer {access_token}                       │
│     ↓                                                            │
│  9. Salva no banco de dados:                                   │
│     INSERT INTO melhor_envio_tokens (                          │
│       access_token,                                            │
│       refresh_token,                                           │
│       expires_at,                                              │
│       melhor_envio_user_id,                                    │
│       melhor_envio_user_email                                  │
│     )                                                           │
│     ↓                                                            │
│  10. Retorna sucesso ao cliente                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│     SUPABASE DATABASE (melhor_envio_tokens)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  access_token        | TOKEN_VALIDO_30_DIAS                    │
│  refresh_token       | TOKEN_RENOVACAO                         │
│  expires_at          | 2025-12-07 14:30:00                     │
│  melhor_envio_user_id| abc123xyz                               │
│  is_valid            | true                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Componentes

### 1️⃣ Cliente (Frontend React)
- `MelhorEnvioOAuthLogin.tsx` - Botão para iniciar OAuth
- Redireciona para URL de autorização do Melhor Envio
- Não manipula tokens (seguro no cliente)

### 2️⃣ Edge Function Callback
- Recebe `code` após autorização
- Troca `code` por `access_token` + `refresh_token`
- Salva tokens no banco
- **Nunca expõe tokens ao frontend**

### 3️⃣ Database (Supabase)
- Tabela `melhor_envio_tokens`
- Armazena tokens de forma segura
- Rastreia expiração e últimas atualizações

### 4️⃣ Edge Function Calculate Shipping
- Lê tokens do banco (via Supabase Admin SDK)
- Usa `access_token` para chamar Melhor Envio API
- Retorna opções de frete ao frontend

### 5️⃣ Melhor Envio API
- Valida tokens
- Retorna cotações de frete
- Gerencia renovação de tokens

## 🔄 Ciclo de Vida do Token

```
Dia 0: Autorização OAuth
├─ Usuario autoriza
├─ Recebe access_token + refresh_token
├─ Tokens salvos no banco
└─ Token válido por 30 dias
   
...30 dias depois...

Dia 30: Token Expirado
├─ Sistema detecta expiração
├─ Usa refresh_token para obter novo access_token
├─ Novo token válido por mais 30 dias
└─ Continua funcionando

...se refresh_token expirar...

Dia 60: Precisa re-autorizar
├─ Redireciona para OAuth novamente
├─ Usuário autoriza
└─ Novo ciclo começa
```

## 🔐 Segurança por Camada

```
┌─────────────────────────────────────────────────┐
│ NAVEGADOR (Cliente)                             │
├─────────────────────────────────────────────────┤
│ ✅ Client ID (público, OK expor)                │
│ ✅ Redirect URI (público, OK expor)             │
│ ❌ Client Secret (NUNCA aqui!)                  │
│ ❌ Access Token (NUNCA aqui!)                   │
│ ❌ Refresh Token (NUNCA aqui!)                  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ SUPABASE EDGE FUNCTION (Servidor)               │
├─────────────────────────────────────────────────┤
│ ✅ Client ID (recebe de env vars)               │
│ ✅ Client Secret (recebe de env vars)           │
│ ✅ Access Token (recebe de env/db)              │
│ ✅ Refresh Token (recebe de db)                 │
│ ✅ Tokens renovados automaticamente             │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ SUPABASE DATABASE (Banco)                       │
├─────────────────────────────────────────────────┤
│ ✅ Tokens criptografados em repouso             │
│ ✅ Acesso apenas via Edge Functions             │
│ ✅ Auditoria de acesso                          │
│ ✅ Row Level Security (RLS) configurada         │
└─────────────────────────────────────────────────┘
```

## ✅ Checklist de Implementação

- [x] Criar página de OAuth login
- [x] Criar Edge Function callback
- [x] Criar tabela de tokens
- [x] Integrar troca de code por token
- [x] Integrar obtenção de dados do usuário
- [ ] Implementar renovação automática de token
- [ ] Testar fluxo completo
- [ ] Migrar para produção
- [ ] Adicionar UI de gerenciamento de tokens
- [ ] Implementar logout/revogação

## 📞 Suporte

Se tiver problemas, verifique:
1. Client ID e Secret estão corretos no Supabase
2. Redirect URI exatamente igual nos dois lugares
3. Permissões corretas no app Melhor Envio
4. Edge Function foi deployada
5. Banco foi migrado
