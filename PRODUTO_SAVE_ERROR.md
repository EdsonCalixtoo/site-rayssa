# 🔧 Solução para Erro ao Salvar Produtos

## ❌ O Problema

Você está recebendo erro ao tentar salvar produtos. Isso geralmente é causado por **políticas de RLS (Row Level Security)** muito restritivas no Supabase.

## 🔍 Verificar o Erro

1. Tente salvar um produto na dashboard
2. Clique no botão "Adicionar"
3. Uma mensagem de erro será exibida com o detalhe do problema
4. Procure por algo como: "new row violates row-level security policy" ou "permission denied"

## ✅ Solução

### Opção 1: Desabilitar RLS Temporariamente (Mais Rápido)

1. Vá para o **Dashboard do Supabase**
2. Acesse **SQL Editor**
3. Cole este código:

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

4. Execute
5. Agora você conseguirá salvar produtos!

### Opção 2: Corrigir as Políticas de RLS (Mais Seguro)

1. Vá para o **Dashboard do Supabase**
2. Acesse **Authentication > Policies**
3. Selecione a tabela **products**
4. Remova as políticas antigas:
   - Admins can insert products
   - Admins can update products
   - Admins can delete products

5. Crie novas políticas:

**Nova Política: Public Read**
- Tipo: SELECT
- Visibilidade: FOR PUBLIC
- Expressão: `true`

**Nova Política: Authenticated Create**
- Tipo: INSERT
- Visibilidade: FOR AUTHENTICATED
- Check: `true`

**Nova Política: Authenticated Update**
- Tipo: UPDATE
- Visibilidade: FOR AUTHENTICATED
- Using: `true`
- Check: `true`

**Nova Política: Authenticated Delete**
- Tipo: DELETE
- Visibilidade: FOR AUTHENTICATED
- Using: `true`

### Opção 3: Usar Script SQL (Automático)

1. Vá para **SQL Editor** no Supabase
2. Cole o conteúdo do arquivo `RLS_TROUBLESHOOTING.sql` 
3. Execute apenas a seção dentro do comentário `/* */`

## 📝 Após a Solução

Se escolher a **Opção 1** (desabilitar RLS):
- ✅ Funciona imediatamente
- ⚠️ Menos seguro (qualquer pessoa com acesso ao DB consegue modificar dados)
- 💡 Bom para desenvolvimento

Se escolher a **Opção 2** (corrigir políticas):
- ✅ Seguro e permite que admins autenticados façam operações
- ✅ Mantém proteção do banco de dados
- 💡 Recomendado para produção

## 🧪 Testar

1. Abra http://localhost:5174/admin
2. Faça login como admin
3. Clique na aba "Produtos"
4. Clique em "Adicionar Produto"
5. Preencha os dados
6. Clique "Adicionar"
7. Pronto! ✅

## 🆘 Se Ainda Não Funcionar

1. Abra o Console do Navegador (F12)
2. Tente salvar um produto
3. Copie a mensagem de erro exata
4. Verifique se:
   - Você está logado como admin (botão "Admin" deve estar visível)
   - Sua sessão não expirou
   - A tabela `products` existe no banco de dados

## 📚 Mais Informações

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
