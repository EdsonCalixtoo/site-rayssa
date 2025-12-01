import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, X, Check } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'feminina',
    product_type: 'anel',
    stock: '',
    is_featured: false,
    weight: '',
    height: '',
    width: '',
    length: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        category: formData.category,
        product_type: formData.product_type,
        stock: parseInt(formData.stock),
        is_featured: formData.is_featured,
        weight: parseInt(formData.weight) || 0,
        height: parseInt(formData.height) || 0,
        width: parseInt(formData.width) || 0,
        length: parseInt(formData.length) || 0,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      }

      await loadProducts();
      handleCloseForm();
      alert(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
    } catch (error) {
      console.error('Error saving product:', error);
      
      let errorMessage = 'Erro desconhecido ao salvar produto';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      alert(`Erro ao salvar produto: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      
      let errorMessage = 'Erro desconhecido ao excluir produto';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Erro ao excluir produto: ${errorMessage}`);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
      category: product.category || 'feminina',
      product_type: (product as any).product_type || 'anel',
      stock: product.stock.toString(),
      is_featured: product.is_featured,
      weight: product.weight.toString(),
      height: product.height.toString(),
      width: product.width.toString(),
      length: product.length.toString(),
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setError('');
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: 'feminina',
      product_type: 'anel',
      stock: '',
      is_featured: false,
      weight: '',
      height: '',
      width: '',
      length: '',
    });
  };

  const CATEGORIES = [
    { id: 'all', label: 'Todos', icon: '📦', color: 'from-slate-400 to-slate-500' },
    { id: 'feminina', label: 'Feminina', icon: '👑', color: 'from-pink-400 to-pink-500' },
    { id: 'masculina', label: 'Masculina', icon: '⌚', color: 'from-blue-400 to-blue-500' },
    { id: 'brinco', label: 'Brincos', icon: '✨', color: 'from-purple-400 to-purple-500' },
    { id: 'linha-luxo', label: 'Linha de Luxo', icon: '💎', color: 'from-yellow-400 to-yellow-500' },
  ];

  const PRODUCT_TYPES = [
    { id: 'anel', label: 'Anel', icon: '💍' },
    { id: 'colar', label: 'Colar', icon: '📿' },
    { id: 'pulseira', label: 'Pulseira', icon: '⌚' },
    { id: 'brinco', label: 'Brinco', icon: '✨' },
    { id: 'tornozeleira', label: 'Tornozeleira', icon: '👣' },
    { id: 'anel-crusador', label: 'Anel Crochet', icon: '💎' },
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Produtos</h3>
          <p className="text-gray-600">Adicione, edite ou remova produtos da sua loja</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Adicionar Produto
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-teal-50 to-white rounded-2xl border-2 border-teal-200">
          <Package className="w-20 h-20 text-teal-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum produto cadastrado</h3>
          <p className="text-gray-600 mb-6">Comece adicionando seu primeiro produto</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            Adicionar Produto
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Category Filter */}
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4">Filtrar por Categoria</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-xl font-bold text-center transition-all transform hover:scale-105 ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-br ${cat.color} text-white shadow-lg scale-105`
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-400'
                  }`}
                >
                  <span className="text-2xl block mb-2">{cat.icon}</span>
                  <span className="text-sm">{cat.label}</span>
                  <span className="text-xs block mt-1 opacity-75">
                    ({products.filter((p) => cat.id === 'all' || p.category?.toLowerCase() === cat.id.toLowerCase()).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              Produtos{selectedCategory !== 'all' && ` - ${CATEGORIES.find((c) => c.id === selectedCategory)?.label}`}
              <span className="text-sm font-normal text-gray-500 ml-2">({filteredProducts.length})</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-teal-200"
            >
              <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-teal-50">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.is_featured && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    DESTAQUE
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-100 px-2 py-1 rounded">
                    {product.category === 'feminina' && '👑 Feminina'}
                    {product.category === 'masculina' && '⌚ Masculina'}
                    {product.category === 'linha-luxo' && '💎 Luxo'}
                  </span>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-100 px-2 py-1 rounded">
                    {(product as any).product_type === 'anel' && '💍 Anel'}
                    {(product as any).product_type === 'colar' && '📿 Colar'}
                    {(product as any).product_type === 'pulseira' && '⌚ Pulseira'}
                    {(product as any).product_type === 'brinco' && '✨ Brinco'}
                    {(product as any).product_type === 'tornozeleira' && '👣 Tornozeleira'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <span className="text-xs font-semibold text-gray-500">
                    Estoque: {product.stock}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <p className="text-2xl font-bold text-teal-600 mb-4">
                  R$ {product.price.toLocaleString('pt-BR')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
                  <p className="font-bold mb-1">❌ Erro ao salvar:</p>
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Ex: Anel de Ouro 18k"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Descreva o produto em detalhes..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estoque</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Joia</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PRODUCT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, product_type: type.id })}
                      className={`p-3 rounded-xl font-semibold text-center transition-all ${
                        formData.product_type === type.id
                          ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg scale-105'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-400'
                      }`}
                    >
                      <span className="text-xl block mb-1">{type.icon}</span>
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Categoria/Público</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-3 rounded-lg font-semibold text-center transition-all text-sm ${
                        formData.category === cat.id
                          ? `bg-gradient-to-br ${cat.color} text-white shadow-lg scale-105`
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-400'
                      }`}
                    >
                      <span className="text-lg block mb-1">{cat.icon}</span>
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">URL da Imagem</label>
                <input
                  type="url"
                  required
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="border-t-2 border-gray-200 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Dimensões para Envio (Jadlog)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Peso (gramas)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Altura (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Ex: 5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Largura (cm)</label>
                    <input
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Ex: 5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Comprimento (cm)</label>
                    <input
                      type="number"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Ex: 5"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">As dimensões são necessárias para cálculo correto do frete via Jadlog</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl border-2 border-teal-200">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
                <label htmlFor="is_featured" className="text-sm font-semibold text-gray-700">
                  Marcar como produto em destaque
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Salvando...'
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editingProduct ? 'Atualizar' : 'Adicionar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

