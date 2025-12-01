/*
  # Adicionar informações detalhadas de pagamento
  
  1. Alterações na Tabela orders
    - `installments` (número de parcelas para cartão de crédito)
    - `installment_amount` (valor de cada parcela)
    - `payment_status` (status do pagamento: pending, paid, failed)
    - `paid_at` (data/hora do pagamento)
  
  2. Notas
    - Campos importantes para controle financeiro
    - Permitir rastreamento completo do pagamento
*/

-- Adicionar colunas de informações de pagamento aos orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'installments'
  ) THEN
    ALTER TABLE orders ADD COLUMN installments INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'installment_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN installment_amount NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN paid_at TIMESTAMPTZ;
  END IF;
END $$;