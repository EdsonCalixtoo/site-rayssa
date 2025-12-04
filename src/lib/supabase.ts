import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Criar cliente Supabase com localStorage seguro
const createSupabaseClient = () => {
  // Se localStorage não está disponível (SSR/build), use memory storage
  if (typeof localStorage === 'undefined') {
    console.warn('⚠️ localStorage não disponível, usando memory storage para Supabase');
    // Fallback para um storage em memória simples
    const memoryStorage: Record<string, string> = {};
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: {
          getItem: (key: string) => Promise.resolve(memoryStorage[key] || null),
          setItem: (key: string, value: string) => {
            memoryStorage[key] = value;
            return Promise.resolve();
          },
          removeItem: (key: string) => {
            delete memoryStorage[key];
            return Promise.resolve();
          },
        },
      },
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images?: string[];
  category: string;
  stock: number;
  is_featured: boolean;
  weight: number;
  height: number;
  width: number;
  length: number;
  created_at: string;
};

export type Customer = {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  number: string;
  complement: string;
  zip_code: string;
  city: string;
  state: string;
  created_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  shipping_cost: number;
  zip_code: string;
  city: string;
  state: string;
  tracking_code: string;
  melhor_envio_id?: string;
  shipping_carrier?: string;
  shipping_deadline?: number;
  estimated_delivery_date?: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
