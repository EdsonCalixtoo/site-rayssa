import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import ProductCard from './ProductCard';

type ProductListProps = {
  onProductClick: (product: Product) => void;
};

export default function ProductList({ onProductClick }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <section id="products" className="py-24 bg-gradient-to-b from-white via-teal-50/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-bold text-teal-700 uppercase tracking-widest bg-teal-100 px-4 py-2 rounded-full">
              Coleção Exclusiva
            </span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Joias que Encantam
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Peças únicas criadas com maestria para celebrar momentos especiais
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
