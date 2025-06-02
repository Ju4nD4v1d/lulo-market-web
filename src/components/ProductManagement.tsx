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
  Loader2,
  Eye,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
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
  const [formData, setFormData] = useState<Partial<Product>>({
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
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        status: product.status,
        images: product.images
      });

      const existingImages = product.images.map(url => ({
        file: null as any,
        preview: url
      }));
      setProductImages(existingImages);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        stock: 0,
        status: 'active',
        images: []
      });
      setProductImages([]);
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
      if (newImages[index].file) {
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
      const uploadedImageUrls = await Promise.all(
        productImages.map(async (image, index) => {
          if (image.file) {
            const imageRef = ref(storage, `stores/${storeId}/products/${Date.now()}_${index}`);
            await uploadBytes(imageRef, image.file);
            return getDownloadURL(imageRef);
          }
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
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, productData);
      } else {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
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
                Product Images
                <span className="text-sm text-gray-500 font-normal ml-2">
                  (Up to {MAX_IMAGES} images, max 1MB each)
                </span>
              </label>
              {error && (
                <div className="mb-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {productImages.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={image.preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Main Image
                      </span>
                    )}
                  </div>
                ))}
                {productImages.length < MAX_IMAGES && (
                  <div
                    className={`
                      aspect-square border-2 border-dashed rounded-lg
                      flex flex-col items-center justify-center
                      ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
                      hover:border-primary-400 transition-colors duration-200 cursor-pointer
                      group
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    <div className="text-center mt-2">
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
                        or drag and drop
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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
                placeholder="Describe your product..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                  transition-colors flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadStoreAndProducts = async () => {
      if (!currentUser) return;

      try {
        const storesRef = collection(db, 'stores');
        const storeQuery = query(storesRef, where('ownerId', '==', currentUser.uid));
        const storeSnapshot = await getDocs(storeQuery);
        
        if (!storeSnapshot.empty) {
          const store = storeSnapshot.docs[0];
          setStoreId(store.id);

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
    setIsModalOpen(false);
    
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

  const handleDeleteProduct = async (product: Product) => {
    try {
      await Promise.all(product.images.map(async (imageUrl) => {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }));

      await deleteDoc(doc(db, 'products', product.id));

      setProducts(prev => prev.filter(p => p.id !== product.id));
      setDeleteConfirmProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onEdit={() => {
          setSelectedProduct(null);
          setIsModalOpen(true);
        }}
        onDelete={() => setDeleteConfirmProduct(selectedProduct)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
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

      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-auto"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-auto"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2 border border-gray-200 rounded-lg p-1">
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
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className={`
                bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all
                ${viewMode === 'list' ? 'flex' : ''}
              `}
            >
              <div className={`relative ${viewMode === 'list' ? 'w-48' : ''}`}>
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'}
                  `}>
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </div>
                </div>
              </div>
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                  </div>
                  <span className="text-lg font-bold text-primary-600">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Boxes className="w-4 h-4" />
                    <span>{product.stock} in stock</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmProduct(product)}
                      className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirmProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Product
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{deleteConfirmProduct.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setDeleteConfirmProduct(null)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(deleteConfirmProduct)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct || undefined}
        storeId={storeId}
      />
    </div>
  );
};