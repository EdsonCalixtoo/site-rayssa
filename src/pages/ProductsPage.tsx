import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';

const CATEGORIES = [
  { id: 'feminina', label: 'Feminina', icon: '👑' },
  { id: 'masculina', label: 'Masculina', icon: '⌚' },
  { id: 'brinco', label: 'Brinco', icon: '✨' },
  { id: 'linha-luxo', label: 'Linha de Luxo', icon: '💎' },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, selectedCategory]);

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

  const filterProducts = () => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter(
          (product) =>
            product.category?.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-teal-200/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-teal-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-teal-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nossos Produtos</h1>
                <p className="text-gray-600 mt-1">
                  {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Filter */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Filtrar por Categoria</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`p-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg'
                  : 'bg-white border-2 border-teal-200 text-gray-900 hover:border-teal-400'
              }`}
            >
              <span className="text-2xl mb-2 block">📦</span>
              Todas
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg'
                    : 'bg-white border-2 border-teal-200 text-gray-900 hover:border-teal-400'
                }`}
              >
                <span className="text-2xl mb-2 block">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600">
              Tente selecionar outra categoria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
