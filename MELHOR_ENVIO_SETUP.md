# Integração Melhor Envio - Guia de Setup

## 📦 O que foi implementado

✅ **Cálculo automático de frete** - Integração completa com API do Melhor Envio
✅ **Edge Function** - Backend serverless para calcular fretes com segurança
✅ **Painel de configuração** - Interface para gerenciar tokens e transportadoras
✅ **Seleção de transportadoras** - Checkout com múltiplas opções de envio
✅ **Suporte Sandbox/Produção** - Ambiente de testes e produção
✅ **Cálculo automático de dimensões** - Usa peso, altura, largura e profundidade dos produtos

---

## 🚀 Como Configurar

### Passo 1: Criar Conta no Melhor Envio

1. Acesse [https://melhorenvio.com.br](https://melhorenvio.com.br)
2. Crie uma conta (ou faça login se já tem)
3. Complete seu cadastro com dados da sua empresa

### Passo 2: Gerar Tokens de Autenticação

1. Vá em **Configurações** (ícone de engrenagem)
2. Clique em **Integrações** ou **API**
3. Procure por **Criar Aplicação** ou **Novo Token**
4. Preencha os dados:
   - **Nome da Aplicação**: "LuxJewels Ecommerce"
   - **Descrição**: "Integração de frete para loja online"
5. Copie os seguintes dados:
   - **Client ID**
   - **Client Secret**
   - **Token de Acesso** (ou gere um novo)

### Passo 3: Configurar no Painel Admin

1. Abra seu site e vá no painel admin (Dashboard)
2. Clique no botão **"⚙️ Frete"** no topo
3. Preencha:
   - **Client ID**: Cole o Client ID do passo 2
   - **Client Secret**: Cole o Client Secret do passo 2
   - **Token de Acesso**: Cole o Token do passo 2
4. Escolha o ambiente:
   - **🧪 Sandbox**: Para testes (recomendado primeiro)
   - **🚀 Produção**: Para vendas reais
5. Selecione as transportadoras que deseja usar:
   - 🚚 **Jadlog**
   - 📮 **Correios**
   - ✈️ **Azul Cargo**
6. Clique em **"Salvar Configurações"**

---

## 🧪 Testando no Sandbox

**Recomendação**: Antes de ativar em produção, teste no ambiente sandbox do Melhor Envio.

1. No painel, escolha **🧪 Sandbox**
2. Vá ao checkout do site
3. Preencha um CEP válido (exemplo: 01310-100 para São Paulo)
4. Veja as transportadoras aparecerem
5. Selecione uma e veja o preço atualizar

---

## 📱 Como Funciona no Checkout

### Etapa 1: Dados de Endereço
1. Cliente preenche:
   - Nome, email, telefone
   - CEP, endereço, cidade, estado
2. Ao sair do campo CEP, o sistema:
   - Busca automaticamente a cidade e estado (ViaCEP)
   - **Envia para Edge Function**:
     - Peso total dos produtos
     - Altura, largura, profundidade dos itens
     - CEP de destino
3. **API Melhor Envio retorna**:
   - Lista de transportadoras disponíveis
   - Preço de cada uma
   - Prazo de entrega

### Etapa 2: Seleção de Transportadora
1. Cliente vê uma lista com:
   - Nome da transportadora
   - Prazo de entrega
   - Valor do frete
2. Pode clicar em qualquer transportadora para trocar
3. O frete é atualizado automaticamente

### Etapa 3: Pagamento
1. Frete já está calculado no total
2. Cliente continua normalmente

---

## 📊 Informações Armazenadas

Cada pedido agora armazena:
- **Transportadora escolhida** (Jadlog, Correios, etc)
- **Valor do frete** exato da API
- **Prazo de entrega** em dias
- **CEP de origem e destino**
- **Rastreamento** (será preenchido após validação do pagamento)

---

## 🔒 Segurança

✅ **Tokens salvos no banco** - Criptografados pelo Supabase
✅ **Edge Function private** - Lógica de cálculo no servidor
✅ **CORS configurado** - Apenas seu domínio acessa
✅ **RLS habilitado** - Dados protegidos no banco

---

## 🚨 Troubleshooting

### "Serviço de frete não configurado"
- Verifique se preencheu todos os campos na configuração
- Certifique-se de clicar em "Salvar Configurações"
- Recarregue a página do checkout

### "Nenhuma transportadora disponível"
- Verifique se o CEP inserido é válido
- Confirme que selecionou as transportadoras desejadas
- Teste no Sandbox do Melhor Envio primeiro
- Verifique os limites de peso/dimensões de cada transportadora

### "Erro na API do Melhor Envio"
- Confirme que o Token está correto
- Tente copiar/colar novamente os dados
- Verifique se sua conta Melhor Envio tem saldo
- Teste no sandbox se estiver em produção

### "Edge Function não responde"
- Verifique a conexão de internet
- Aguarde alguns segundos e tente novamente
- Veja o console do navegador (F12) para mais detalhes

---

## 📈 Próximos Passos

### Automações Futuras
1. **Gerar etiqueta** automaticamente após pagamento confirmado
2. **Integração com sistema de emissão de NF**
3. **Webhook do Melhor Envio** para atualizar rastreamento
4. **Notificações ao cliente** via email/SMS

### Dimensões Recomendadas

Para melhor cálculo de frete, defina nos seus produtos:
- **Peso**: em gramas
- **Altura**: em cm
- **Largura**: em cm
- **Comprimento**: em cm

Exemplo (Pulseira):
- Peso: 50g
- Altura: 2cm
- Largura: 10cm
- Comprimento: 5cm

---

## 📞 Suporte

- **Dúvidas Melhor Envio**: https://suporte.melhorenvio.com.br
- **API Docs**: https://docs.melhorenvio.com.br
- **Status API**: https://status.melhorenvio.com.br
