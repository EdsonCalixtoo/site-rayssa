import { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';

type ImageUploadProps = {
  onImagesUpload: (urls: string[]) => void;
  onClose: () => void;
};

export default function ImageUpload({ onImagesUpload, onClose }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const newPreviews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
          if (newPreviews.length === files.length) {
            setPreviews(prev => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (previews.length === 0) {
      setError('Selecione pelo menos uma imagem');
      return;
    }

    setUploading(true);
    setError('');
    const uploadedUrls: string[] = [];

    try {
      // Usar as previews como data URLs (armazenadas localmente)
      // Para produção, você deveria enviar para o Supabase Storage
      for (let i = 0; i < previews.length; i++) {
        const preview = previews[i];
        
        // Se já é uma URL (data URL), apenas adicionar
        if (preview.startsWith('data:')) {
          uploadedUrls.push(preview);
        }
      }

      if (uploadedUrls.length === 0) {
        setError('Nenhuma imagem foi carregada');
        return;
      }

      setUploadedImages(uploadedUrls);
    } catch (err) {
      const error = err as Error;
      setError(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (uploadedImages.length === 0 && previews.length > 0) {
      handleUpload();
    } else {
      onImagesUpload(uploadedImages.length > 0 ? uploadedImages : previews);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-6 h-6 text-teal-600" />
            Fazer Upload de Imagens
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Input de arquivo */}
        <div className="mb-6">
          <label className="block">
            <div className="border-3 border-dashed border-teal-300 rounded-xl p-8 text-center hover:border-teal-500 transition-colors cursor-pointer bg-teal-50 hover:bg-teal-100">
              <Upload className="w-12 h-12 text-teal-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-900 mb-1">Clique para selecionar imagens</p>
              <p className="text-sm text-gray-600">ou arraste arquivos aqui</p>
              <p className="text-xs text-gray-500 mt-2">Suporta múltiplas imagens (JPG, PNG)</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Pré-visualizações */}
        {previews.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Imagens Selecionadas ({previews.length})</h3>
            <div className="grid grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={() => removePreview(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute top-1 left-1 bg-teal-600 text-white text-xs rounded px-2 py-1">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors font-bold"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={uploading || previews.length === 0}
            className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {uploading ? 'Carregando...' : `Confirmar (${previews.length})`}
          </button>
        </div>

        <p className="text-xs text-gray-600 text-center mt-4">
          As imagens serão exibidas em ordem de seleção. Você pode reordená-las depois se necessário.
        </p>
      </div>
    </div>
  );
}
