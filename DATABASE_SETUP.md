# 🚀 Como Criar as Tabelas no Supabase

O erro `Could not find the table 'public.products'` significa que as tabelas não foram criadas no banco de dados. Siga um dos métodos abaixo:

## ✅ Método 1: Via Dashboard do Supabase (Mais Fácil)

1. **Abra o Supabase Dashboard:**
   - Acesse: https://app.supabase.com
   - Login com suas credenciais

2. **Acesse o SQL Editor:**
   - Clique em **"SQL Editor"** no menu lateral esquerdo

3. **Cole o SQL:**
   - Abra o arquivo `CREATE_TABLES.sql` neste projeto
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase

4. **Execute:**
   - Clique no botão **"Execute"** (ou CMD+Enter)
   - Aguarde a conclusão

5. **Pronto!** ✅
   - As tabelas foram criadas
   - Volte para a aplicação e tente salvar um produto novamente

---

## 🔧 Método 2: Via Supabase CLI (Para Desenvolvedores)

```bash
# 1. Link o projeto (primeira vez)
supabase link --project-ref lfbwxyzqdklfvuzzkctn

# 2. Fazer push das migrations
supabase db push

# 3. Pronto!
```

---

## 📝 Método 3: Executar o Script

```bash
bash init-db.sh
```

---

## ✨ Após Criar as Tabelas

1. Volte para: http://localhost:5174/admin
2. Clique em **"Produtos"**
3. Clique em **"Adicionar Produto"**
4. Preencha os dados e clique em **"Adicionar"**
5. Produto deve ser salvo com sucesso! 🎉

---

## 🆘 Se Ainda Não Funcionar

### Erro: "new row violates row-level security policy"

Se receber este erro, as políticas de RLS estão muito restritivas. Execute no SQL Editor:

```sql
-- Desabilitar RLS temporariamente para teste
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
```

Depois de testar, você pode reabilitar com políticas mais seguras.

---

## 📚 Mais Informações

- **Supabase Project URL:** https://app.supabase.com/project/lfbwxyzqdklfvuzzkctn
- **Arquivo de criação das tabelas:** `CREATE_TABLES.sql`
- **Política de RLS:** `RLS_TROUBLESHOOTING.sql`
