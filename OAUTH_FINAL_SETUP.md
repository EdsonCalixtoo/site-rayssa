# 🚀 OAuth Melhor Envio - Configuração Completa

## ✅ O que foi feito

1. ✅ **Client ID e Secret configurados** no Supabase
2. ✅ **Edge Functions deployadas**:
   - `melhor-envio-callback` - Recebe autorização
   - `calculate-shipping` - Calcula fretes
3. ✅ **Frontend atualizado** com componente OAuth
4. ✅ **.env local configurado**

---

## 📋 Próximos Passos - Configurar no Melhor Envio

Você precisa voltar no painel do Melhor Envio e preencher com dados CORRETOS:

### 1. Acesse: https://app.melhorenvio.com.br/integracoes/area-dev

### 2. Preencha o formulário assim:

| Campo | Valor |
|-------|-------|
| **Nome da plataforma** | Rayssa Joias |
| **Site da plataforma** | https://seusite.vercel.app |
| **E-mail de contato** | seu_email@exemplo.com |
| **E-mail do suporte técnico** | seu_email@exemplo.com |
| **URL do seu ambiente para testes** | https://ncxpxtzsqutzheqgpfpo.supabase.co |
| **URL de redirecionamento após autorização** | https://ncxpxtzsqutzheqgpfpo.supabase.co/functions/v1/melhor-envio-callback |
| **Descrição** | Integração para cálculo de fretes em tempo real |

### 3. Marque as permissões:
- ✅ `shipping-calculate` (Cotação de fretes)
- ✅ `shipping-companies` (Consulta de transportadoras)

### 4. Marque a caixa:
✅ "Permitir que o usuário, ao instalar o aplicativo, altere as configurações de transportadora e serviços"

### 5. Clique em **CADASTRAR**

---

## 📊 Dados Atuais

**Client ID:** `7625`  
**Client Secret:** `V00WrsdtMM5BUVVxkaF2fBJ6ITd1Q9MTKBOkRwi4`

Estas credenciais foram configuradas no Supabase:
- ✅ `MELHOR_ENVIO_CLIENT_ID`
- ✅ `MELHOR_ENVIO_CLIENT_SECRET`
- ✅ `MELHOR_ENVIO_REDIRECT_URI`

---

## 🧪 Testar Localmente

1. **Certifique-se que tem as variáveis no `.env`:**
   ```env
   VITE_MELHOR_ENVIO_CLIENT_ID=7625
   VITE_MELHOR_ENVIO_REDIRECT_URI=https://ncxpxtzsqutzheqgpfpo.supabase.co/functions/v1/melhor-envio-callback
   ```

2. **Inicie o servidor local:**
   ```bash
   npm run dev
   ```

3. **Vá para:** `http://localhost:5173`

4. **Procure pelo botão "Conectar Melhor Envio"** (ou adicione na página)

5. **Clique e você será redirecionado para:**
   ```
   https://sandbox.melhorenvio.com.br/oauth/authorize?
   client_id=7625&
   redirect_uri=https://ncxpxtzsqutzheqgpfpo.supabase.co/functions/v1/melhor-envio-callback&
   response_type=code&
   scope=shipping-calculate shipping-companies
   ```

6. **Autorize as permissões**

7. **Será redirecionado de volta** com sucesso ✅

---

## 🔍 Verificar Status

### Verificar se Edge Functions estão ativas:
```bash
npx supabase functions list --project-ref ncxpxtzsqutzheqgpfpo
```

### Ver logs da Edge Function:
- Vá para: https://supabase.com/dashboard/project/ncxpxtzsqutzheqgpfpo/functions
- Clique em `melhor-envio-callback`
- Veja os logs

### Verificar variáveis de ambiente:
```bash
npx supabase secrets list --project-ref ncxpxtzsqutzheqgpfpo
```

---

## 📊 Fluxo Completo

```
1. Usuário clica "Conectar Melhor Envio"
   ↓
2. Redirecionado para OAuth Melhor Envio
   ↓
3. Autoriza permissões
   ↓
4. Redirecionado para Edge Function callback
   ↓
5. Edge Function troca CODE por ACCESS_TOKEN + REFRESH_TOKEN
   ↓
6. Tokens salvos no banco (tabela melhor_envio_tokens)
   ↓
7. Cálculo de frete usa tokens salvos
   ↓
8. Retorna opções de envio ao checkout ✅
```

---

## ⚠️ Troubleshooting

### "Client invalid"
- **Causa**: Redirect URI não corresponde
- **Solução**: Verifique se a URL é exatamente igual:
  ```
  https://ncxpxtzsqutzheqgpfpo.supabase.co/functions/v1/melhor-envio-callback
  ```

### "Token não encontrado"
- **Causa**: Secrets não foram configurados no Supabase
- **Solução**: Execute:
  ```bash
  npx supabase secrets set MELHOR_ENVIO_CLIENT_SECRET=V00WrsdtMM5BUVVxkaF2fBJ6ITd1Q9MTKBOkRwi4
  ```

### "Função não encontrada"
- **Causa**: Edge Functions não foram deployadas
- **Solução**:
  ```bash
  npx supabase functions deploy melhor-envio-callback --project-ref ncxpxtzsqutzheqgpfpo
  npx supabase functions deploy calculate-shipping --project-ref ncxpxtzsqutzheqgpfpo
  ```

---

## 🎯 Próximas Melhorias

- [ ] Implementar renovação automática de token (30 dias)
- [ ] Adicionar UI para gerenciar autorizações
- [ ] Testar com dados reais
- [ ] Migrar para produção (mudar URL sandbox para produção)
- [ ] Implementar revogação de token

---

## 📞 Suporte

Se precisar de ajuda, verifique:
1. Todos os dados estão corretos no Melhor Envio
2. Redirect URI é exatamente igual
3. Edge Functions estão deployadas
4. Secrets foram configuradas no Supabase
5. Verifique os logs das funções no dashboard
