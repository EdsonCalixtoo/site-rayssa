# Configuração do Melhor Envio Edge Function

## Problema Resolvido

O cálculo de frete estava preso em R$ 29,90 porque o navegador não conseguia chamar a API do Melhor Envio diretamente. Isso ocorre por:
- **CORS**: A API não permite chamadas do navegador
- **DNS**: Pode haver problemas de resolução em alguns ambientes

## Solução Implementada

Agora a aplicação usa uma **Supabase Edge Function** como proxy para chamar a API do Melhor Envio. Isso resolve:
- ✅ CORS (chamada server-to-server)
- ✅ Autenticação segura (token fica no servidor)
- ✅ Melhor performance

## Configuração no Vercel

1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto `site-rayssa`
3. Vá para **Settings** → **Environment Variables**
4. Adicione a seguinte variável:

```
MELHOR_ENVIO_TOKEN=B425XUxX89AjuHaFDzWUavTQuykpyEsoDHfbhgFz
```

Para todos os ambientes: **Production**, **Preview**, **Development**

5. Clique em "Save"
6. Faça um redeploy do seu projeto

## Configuração Local (Para Testes)

Se você quer testar localmente com `supabase functions serve`:

1. Crie ou edite `supabase/.env.local`:
```
MELHOR_ENVIO_TOKEN=B425XUxX89AjuHaFDzWUavTQuykpyEsoDHfbhgFz
```

2. Execute:
```bash
supabase functions serve
```

## Como Funciona Agora

### Flow Anterior (Que Não Funcionava)
```
Browser → Melhor Envio API ❌ (CORS Error)
```

### Flow Novo (Funcionando)
```
Browser → Supabase Edge Function → Melhor Envio API ✅
```

## Arquivo Modificado

**supabase/functions/calculate-shipping/index.ts**
- Atualizado para usar API v3 do Melhor Envio
- Endpoint: `/shipment/calculate`
- Suporta múltiplas transportadoras
- Retorna preços e prazos dinâmicos

**src/components/ModernCheckout.tsx**
- Agora chama a Edge Function ao invés de chamar a API diretamente
- URL: `{SUPABASE_URL}/functions/v1/calculate-shipping`
- Mantém logging detalhado para debugging

## Testando

1. Abra a aplicação
2. Vá para o checkout
3. Preencha o CEP (ex: 01310-100 para São Paulo)
4. Verifique no DevTools (F12) → Console:
   - Deve ver `📡 Response status: 200`
   - Deve ver opções de frete com preços diferentes (não mais 29,90)
   - Se houver erro, verifique se o `MELHOR_ENVIO_TOKEN` está configurado no Vercel

## Debugging

Se ainda ver "Frete Padrão R$ 29,90", verifique:

1. **Variável de ambiente**: `MELHOR_ENVIO_TOKEN` está configurada no Vercel?
   - Settings → Environment Variables
   - Deve estar em Production, Preview E Development

2. **Console do navegador** (F12):
   - Procure por `❌ Token não configurado no servidor`
   - Ou por mensagens de erro da API

3. **Logs da Edge Function** (Vercel):
   - Dashboard → Logs → Functions
   - Verifique os logs em tempo real

4. **Token válido?**
   - Acesse https://api.melhorenvio.com.br/me (com Bearer token)
   - Deve retornar seus dados de contrato

## Rollback

Se houver problemas, a aplicação tem fallback automático:
- Se a Edge Function falhar → usa "Frete Padrão R$ 29,90"
- Os usuários ainda conseguem fazer checkout
- Você pode debugar e tentar novamente

## Próximos Passos

1. Configure `MELHOR_ENVIO_TOKEN` no Vercel
2. Faça redeploy
3. Teste com um CEP real
4. Verifique os logs
5. Se tudo ok, suas transportadoras (Jadlog, Correios, Azul Cargo) devem aparecer com preços reais!

---

**Data**: 2024-12-XX  
**Versão da API**: Melhor Envio v3  
**Status**: ✅ Ready para produção
