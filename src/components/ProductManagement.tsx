import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Grid,
  List,
  X,
  Upload,
  DollarSign,
  Tag,
  Boxes,
  AlertCircle,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  status: 'active' | 'draft' | 'outOfStock';
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductImage {
  file: File;
  preview: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  product?: Product;
  storeId: string;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, storeId }) => {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    status: 'active',
    images: []
  });
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load existing images if editing a product
    if (product?.images) {
      const loadedImages = product.images.map(url => ({
        file: null as any, // We don't have the file object for existing images
        preview: url
      }));
      setProductImages(loadedImages);
    }
  }, [product]);

  const validateAndProcessFiles = (files: FileList | null) => {
    if (!files) return;

    const newImages: ProductImage[] = [];
    let errorMessage = '';

    Array.from(files).forEach(file => {
      if (productImages.length + newImages.length >= MAX_IMAGES) {
        errorMessage = `Maximum ${MAX_IMAGES} images allowed`;
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errorMessage = 'One or more images exceed 1MB size limit';
        return;
      }

      if (!file.type.startsWith('image/')) {
        errorMessage = 'Only image files are allowed';
        return;
      }

      newImages.push({
        file,
        preview: URL.createObjectURL(file)
      });
    });

    if (newImages.length > 0) {
      setProductImages(prev => [...prev, ...newImages]);
      setError('');
    } else if (errorMessage) {
      setError(errorMessage);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
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
    validateAndProcessFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndProcessFiles(e.target.files);
  };

  const removeImage = (index: number) => {
    setProductImages(prev => {
      const newImages = [...prev];
      if (newImages[index].file) { // Only revoke if it's a new image
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      // Upload images first
      const uploadedImageUrls = await Promise.all(
        productImages.map(async (image, index) => {
          if (image.file) {
            // For new images, upload to Firebase Storage
            const imageRef = ref(storage, `stores/${storeId}/products/${Date.now()}_${index}`);
            await uploadBytes(imageRef, image.file);
            return getDownloadURL(imageRef);
          }
          // For existing images, keep the URL
          return image.preview;
        })
      );

      const productData = {
        ...formData,
        images: uploadedImageUrls,
        storeId,
        updatedAt: new Date()
      };

      if (product?.id) {
        // Update existing product
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, productData);
      } else {
        // Create new product
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date()
        });
      }

      onSave(productData);
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images (Up to 5)
              </label>
              {error && (
                <div className="mb-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {productImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 hover:bg-red-200 
                        rounded-full text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {productImages.length < MAX_IMAGES && (
                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center
                      ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
                      hover:border-primary-400 transition-colors duration-200 cursor-pointer
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <div className="text-center">
                      <label className="cursor-pointer">
                        <span className="text-sm text-primary-600 hover:text-primary-500">Upload</span>
                        <input
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Max 1MB per image
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="block w-full"
                  required
                />
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
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                  transition-colors flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>{product ? 'Update Product' : 'Add Product'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ProductManagement = () => {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string>('');

  useEffect(() => {
    const loadStoreAndProducts = async () => {
      if (!currentUser) return;

      try {
        // First get the store ID
        const storesRef = collection(db, 'stores');
        const storeQuery = query(storesRef, where('ownerId', '==', currentUser.uid));
        const storeSnapshot = await getDocs(storeQuery);
        
        if (!storeSnapshot.empty) {
          const store = storeSnapshot.docs[0];
          setStoreId(store.id);

          // Then load products for this store
          const productsRef = collection(db, 'products');
          const productsQuery = query(productsRef, where('storeId', '==', store.id));
          const productsSnapshot = await getDocs(productsQuery);
          
          const loadedProducts = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
          
          setProducts(loadedProducts);
        }
      } catch (error) {
        console.error('Error loading store and products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoreAndProducts();
  }, [currentUser]);

  const categories = ['all', ...new Set(products.map(product => product.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = async (productData: Partial<Product>) => {
    // Product saving is now handled in the modal
    setIsModalOpen(false);
    
    // Refresh products list
    if (currentUser && storeId) {
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, where('storeId', '==', storeId));
      const productsSnapshot = await getDocs(productsQuery);
      
      const updatedProducts = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(updatedProducts);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
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
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
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
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'}
                  `}>
                    {product.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        storeId={storeId}
      />
    </div>
  );
};