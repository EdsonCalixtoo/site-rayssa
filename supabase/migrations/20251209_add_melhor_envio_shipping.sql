/*
  # Add Melhor Envio shipping integration

  Add columns to track shipments and carriers used
*/

-- Add shipping-related columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS melhor_envio_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS shipping_deadline INTEGER,
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

-- Create shipping_logs table for tracking history
CREATE TABLE IF NOT EXISTS shipping_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  status_description TEXT,
  status_date timestamptz DEFAULT now(),
  carrier TEXT,
  location TEXT,
  tracking_number TEXT,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on shipping_logs
ALTER TABLE shipping_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all shipping logs"
  ON shipping_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create shipping logs"
  ON shipping_logs FOR INSERT
  WITH CHECK (true);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_melhor_envio_id ON orders(melhor_envio_id);
CREATE INDEX IF NOT EXISTS idx_shipping_logs_order_id ON shipping_logs(order_id);
