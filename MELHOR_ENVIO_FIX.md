# Correção - Frete Fixo em R$ 29.90

## Problema Identificado
O cálculo de frete está retornando um valor fixo de **R$ 29.90** porque:
1. A Edge Function do Supabase está com erro de CORS
2. A requisição falha e cai no fallback de erro

## Erros no Console
- `Access to fetch at 'https://ncxpxtzsqutzheqgpfpo.supabase.co/functions/v1/calculate-shipping' from origin 'https://www.rtratas.com.br' has been blocked by CORS policy`
- `Failed to load resource: net::ERR_FAILED`

## Soluções Implementadas

### 1. ✅ Correção de CORS na Edge Function
**Arquivo:** `supabase/functions/calculate-shipping/index.ts`

- Adicionado headers CORS mais robustos
- Removida verificação desnecessária de origem
- Adicionado `Origin` aos headers aceitos

### 2. ✅ Adição de Token de Autenticação
**Arquivo:** `src/components/ModernCheckout.tsx`

- Adicionado `Authorization: Bearer {anonKey}` aos headers da requisição
- Recuperado `VITE_SUPABASE_ANON_KEY` do `.env`

### 3. ✅ Melhor Tratamento de Erros
**Arquivo:** `src/components/ModernCheckout.tsx`

- Verificação de `response.ok` antes de processar
- Leitura de erros HTTP específicos
- Logs detalhados para debugging

## Próximos Passos para Deployar

### Opção 1: Deploy via CLI (Recomendado)
```bash
# Fazer login no Supabase
npx supabase login

# Deploy da Edge Function
npx supabase functions deploy calculate-shipping
```

### Opção 2: Deploy via Dashboard Supabase
1. Acesse: https://app.supabase.com/project/ncxpxtzsqutzheqgpfpo/functions
2. Abra a função `calculate-shipping`
3. Cole o conteúdo de `supabase/functions/calculate-shipping/index.ts`
4. Clique em "Deploy"

## Verificar se Funciona
1. Abra o site
2. Vá para o carrinho e checkout
3. Insira um CEP válido (ex: 01311-100)
4. O frete deve calcular corretamente
5. Abra o DevTools (F12) > Console para ver os logs de debug

## Variáveis de Ambiente Necessárias

**`.env` (já configurado):**
- `VITE_SUPABASE_URL` ✅
- `VITE_SUPABASE_ANON_KEY` ✅
- `VITE_MELHOR_ENVIO_TOKEN` ✅

**Edge Function precisa de:**
- `MELHOR_ENVIO_TOKEN` (configurar no Supabase Dashboard)

### Como Configurar o Token na Edge Function

1. Acesse: https://app.supabase.com/project/ncxpxtzsqutzheqgpfpo/settings/functions
2. Em "Edge Function secrets", adicione:
   - **Nome:** `MELHOR_ENVIO_TOKEN`
   - **Valor:** `B425XUxX89AjuHaFDzWUavTQuykpyEsoDHfbhgFz`

## Testando Localmente
```bash
# Instalar dependências do Supabase
npm install -g supabase

# Iniciar servidor local
supabase start

# Testar função localmente
curl -X POST http://localhost:54321/functions/v1/calculate-shipping \
  -H "Content-Type: application/json" \
  -d '{
    "to": {
      "zipcode": "01311100",
      "state": "SP",
      "city": "São Paulo",
      "address": "Avenida Paulista",
      "number": "1000"
    },
    "products": [{
      "id": "1",
      "width": 15,
      "height": 10,
      "length": 20,
      "weight": 0.5,
      "quantity": 1,
      "insurance_value": 100,
      "description": "Produto teste"
    }]
  }'
```

## Debug Checklist

- [ ] Edge Function foi deployada?
- [ ] Token `MELHOR_ENVIO_TOKEN` está configurado no Supabase?
- [ ] Headers CORS estão corretos?
- [ ] Token Melhor Envio é válido?
- [ ] CEP testado é válido?
- [ ] Carrinho tem produtos?

## Contato com Suporte
Se o erro persistir:
1. Verifique os logs da Edge Function no Supabase Dashboard
2. Teste a API do Melhor Envio diretamente com o token
3. Verifique as quotas e limites da sua conta Supabase
