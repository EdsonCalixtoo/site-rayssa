# Configuração OAuth 2.0 Melhor Envio

## 📋 Resumo

O aplicativo agora usa **OAuth 2.0** para autenticar com a API do Melhor Envio, em vez de um token fixo. Isso garante segurança, tokens atualizáveis e melhor controle.

## 🔧 Passos de Configuração

### 1. Criar Aplicativo no Melhor Envio

1. Acesse: https://app.melhorenvio.com.br/integracoes/area-dev
2. Clique em **"Cadastrar Aplicativo"**
3. Preencha o formulário:
   - **Nome do App**: `Rayssa Joias`
   - **Descrição**: `Integração de cálculo de fretes para loja de joias`
   - **URL de Callback (Redirect URI)**: 
     ```
     https://ncxpxtzsqutzheqgpfpo.supabase.co/functions/v1/melhor-envio-callback
     ```
   - **Permissões necessárias**:
     - ✅ `shipping-calculate` (Cotação de fretes)
     - ✅ `shipping-companies` (Consulta de transportadoras)

4. Após criar, você receberá:
   - **Client ID**
   - **Client Secret**

### 2. Configurar Variáveis no Supabase

#### No Supabase Dashboard:
1. Vá para **Project Settings** → **Environment Variables**
2. Adicione as variáveis:

```env
MELHOR_ENVIO_CLIENT_ID=seu_client_id
MELHOR_ENVIO_CLIENT_SECRET=seu_client_secret
MELHOR_ENVIO_REDIRECT_URI=https://ncxpxtzsqutzheqgpfpo.supabase.co/functions/v1/melhor-envio-callback
```

#### Localmente (`.env`):
```env
VITE_MELHOR_ENVIO_CLIENT_ID=seu_client_id
VITE_MELHOR_ENVIO_REDIRECT_URI=https://ncxpxtzsqutzheqgpfpo.supabase.co/functions/v1/melhor-envio-callback
```

### 3. Executar Migração do Banco

```bash
npx supabase migration up
```

Isso criará a tabela `melhor_envio_tokens` para armazenar tokens dos usuários.

### 4. Deploy das Edge Functions

```bash
npx supabase functions deploy melhor-envio-callback
npx supabase functions deploy calculate-shipping
```

## 🔄 Fluxo de Autenticação

```
1. Usuário clica "Conectar Melhor Envio"
   ↓
2. Redirecionado para OAuth do Melhor Envio
   ↓
3. Usuário autoriza permissões
   ↓
4. Retorna para callback com CODE
   ↓
5. Edge Function troca CODE por access_token + refresh_token
   ↓
6. Tokens são salvos no banco de dados
   ↓
7. Cálculo de frete usa tokens salvos
```

## 📝 Fluxo Completo no Código

### Frontend (React)
- **Componente**: `src/components/MelhorEnvioOAuthLogin.tsx`
- **Ação**: Redireciona para OAuth do Melhor Envio

### Backend (Edge Function)
- **Callback**: `supabase/functions/melhor-envio-callback/index.ts`
  - Recebe o `code` após autorização
  - Troca `code` por `access_token` + `refresh_token`
  - Salva tokens no banco
  - Retorna sucesso

- **Calcular Frete**: `supabase/functions/calculate-shipping/index.ts`
  - Usa tokens salvos do banco
  - Envia ao Melhor Envio
  - Retorna opções de frete

### Banco de Dados
- **Tabela**: `melhor_envio_tokens`
  - `access_token` - Token ativo (30 dias)
  - `refresh_token` - Para renovar token
  - `expires_at` - Data de expiração
  - `melhor_envio_user_id` - ID do usuário no Melhor Envio

## 🔐 Segurança

✅ **O que é seguro:**
- Client Secret nunca é exposto ao frontend
- Access token armazenado apenas no servidor (Supabase)
- Tokens renovados automaticamente a cada 30 dias
- Front usa apenas Client ID (público)

❌ **O que foi removido:**
- Token fixo hardcoded
- Fallback de preços estimados (agora erro explícito)

## 🧪 Teste Local

1. Certifique-se que as variáveis estão no `.env`
2. Inicie o app:
   ```bash
   npm run dev
   ```
3. Clique em "Conectar Melhor Envio"
4. Você será redirecionado para sandbox do Melhor Envio
5. Autorize as permissões
6. Será redirecionado de volta com sucesso

## 📞 Troubleshooting

### "Client invalid" na autorização
- **Causa**: Redirect URI não corresponde
- **Solução**: Verifique se a URL em `.env` e no app Melhor Envio são idênticas

### "Token request failed"
- **Causa**: Client ID ou Client Secret incorreto
- **Solução**: Verifique variáveis de ambiente no Supabase

### "User not authorized"
- **Causa**: Permissões insuficientes no app
- **Solução**: Adicione `shipping-calculate` às permissões do app

## 📚 Próximos Passos

1. ✅ Implementar fluxo de renovação de token (30 dias)
2. ✅ Adicionar UI para gerenciar autorizações
3. ✅ Testar com dados reais do Melhor Envio
4. ✅ Migrar para produção (mudar URL de sandbox para produção)

## 🔗 Referências

- [Documentação OAuth Melhor Envio](https://docs.melhorenvio.com.br/reference/fluxo-de-autoriza%C3%A7%C3%A3o)
- [Solicitação de Token](https://docs.melhorenvio.com.br/reference/solicitacao-do-token)
- [OAuth 2.0 Standards](https://www.oauth.com/)
