import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Grid,
  List,
  X,
  Upload,
  DollarSign,
  Tag,
  Boxes,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ProductDetails } from './ProductDetails';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  status: 'active' | 'draft' | 'outOfStock';
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  product?: Product;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    status: 'active',
    images: []
  });
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setIsLoading(true);

    // Simulate image upload delay
    setTimeout(() => {
      const newImages = imageFiles.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
      setIsLoading(false);
    }, 1500);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images
              </label>
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8
                  ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
                  hover:border-primary-400 transition-colors duration-200
                  text-center cursor-pointer
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                    <p className="mt-2 text-sm text-gray-600">Uploading images...</p>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInput}
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="w-full h-full flex flex-col items-center"
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Drag and drop your images here, or click to select files
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </label>
                  </>
                )}
              </div>

              {formData.images && formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1
                          text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="block w-full"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="hot">Hot</option>
                  <option value="frozen">Frozen</option>
                  <option value="baked">Baked</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="block w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    id="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="block w-full pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  id="stock"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="block w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex space-x-4">
                {['active', 'draft', 'outOfStock'].map((status) => (
                  <label key={status} className="inline-flex items-center">
                    <input
                      type="radio"
                      value={status}
                      checked={formData.status === status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="form-radio text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {status === 'outOfStock' ? 'Out of Stock' : status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {product ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const ProductManagement = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  const categories = [
    { id: 'hot', label: 'Hot' },
    { id: 'frozen', label: 'Frozen' },
    { id: 'baked', label: 'Baked' },
    { id: 'other', label: 'Other' }
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        // If trying to select 'hot' when 'frozen' is selected, or vice versa
        if ((category === 'hot' && prev.includes('frozen')) ||
            (category === 'frozen' && prev.includes('hot'))) {
          return prev;
        }
        return [...prev, category];
      }
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = (product: Partial<Product>) => {
    // Handle save logic here
    setIsModalOpen(false);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsViewingDetails(true);
  };

  if (isViewingDetails && selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => setIsViewingDetails(false)}
        onEdit={() => {
          setIsViewingDetails(false);
          setIsModalOpen(true);
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your store's products</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg 
            hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  disabled={
                    (category.id === 'hot' && selectedCategories.includes('frozen')) ||
                    (category.id === 'frozen' && selectedCategories.includes('hot'))
                  }
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${selectedCategories.includes(category.id)
                      ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    ${((category.id === 'hot' && selectedCategories.includes('frozen')) ||
                       (category.id === 'frozen' && selectedCategories.includes('hot')))
                      ? 'opacity-50 cursor-not-allowed'
                      : ''}
                  `}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <Grid className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
          <div className="max-w-md mx-auto">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">
              Start adding products to your store. You can add product details, images, and manage inventory.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg 
                hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Product
            </button>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
          {/* Product items would go here */}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct || undefined}
      />
    </div>
  );
};