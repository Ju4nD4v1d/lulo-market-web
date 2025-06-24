import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
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
  Loader2,
  Flame,
  Snowflake,
  Cookie,
  Package2
} from 'lucide-react';
import { ProductDetails } from './ProductDetails';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  ownerId: string;
  storeId: string;
  pstPercentage?: number;
  gstPercentage?: number;
}

const defaultFormData = {
  name: '',
  description: '',
  price: 0,
  category: '',
  stock: 0,
  status: 'active' as const,
  images: [],
  pstPercentage: 0,
  gstPercentage: 0
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
  product?: Product;
  storeId: string;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, storeId }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<Product>>(defaultFormData);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(product || defaultFormData);
      setError('');
    }
  }, [isOpen, product]);

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

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const currentImagesCount = formData.images?.length || 0;
    const remainingSlots = 5 - currentImagesCount;

    if (remainingSlots <= 0) {
      setError(t('products.maxImagesError'));
      return;
    }

    const filesToUpload = imageFiles.slice(0, remainingSlots);

    setIsLoading(true);
    setError('');

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const storageRef = ref(storage, `products/${currentUser?.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const imageUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...imageUrls]
      }));

      if (imageFiles.length > remainingSlots) {
        setError(`Only ${remainingSlots} image${remainingSlots === 1 ? '' : 's'} uploaded. Maximum limit reached.`);
      }
    } catch (err) {
      setError(t('products.uploadError'));
      console.error('Error uploading images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !storeId) return;

    try {
      await onSave({
        ...formData,
        ownerId: currentUser.uid,
        storeId: storeId
      });
      onClose();
    } catch (err) {
      setError('Failed to save product. Please try again.');
      console.error('Error saving product:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? t('products.editModal') : t('products.addNew')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 rounded-lg text-red-700 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('products.imagesLabel')}
            </label>
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8
                ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
                ${(formData.images?.length || 0) >= 5 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400'}
                transition-colors duration-200
                text-center
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                  <p className="mt-2 text-sm text-gray-600">{t('store.saveProgress.uploadingImages')}</p>
                </div>
              ) : (formData.images?.length || 0) >= 5 ? (
                <div className="text-center text-gray-500">
                  <p>{t('products.maxImages')}</p>
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
                    disabled={(formData.images?.length || 0) >= 5}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`w-full h-full flex flex-col items-center ${(formData.images?.length || 0) >= 5 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      {t('products.dragDrop')}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('products.uploadHint')} ({5 - (formData.images?.length || 0)} remaining)
                    </p>
                  </label>
                </>
              )}
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}

            {formData.images && formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-4">
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
                {t('products.name')}
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
                {t('products.category')}
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="block w-full"
                required
              >
                <option value="">{t('products.selectCategory')}</option>
                <option value="hot">{t('products.category.hot')}</option>
                <option value="frozen">{t('products.category.frozen')}</option>
                <option value="baked">{t('products.category.baked')}</option>
                <option value="other">{t('products.category.other')}</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('products.descriptionLabel')}
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
                {t('products.price')}
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
                {t('products.stockLabel')}
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

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="pstPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                {t('products.pstPercentage')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="pstPercentage"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.pstPercentage}
                  onChange={(e) => setFormData({ ...formData, pstPercentage: parseFloat(e.target.value) })}
                  className="block w-full pr-8"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  %
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="gstPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                {t('products.gstPercentage')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="gstPercentage"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.gstPercentage}
                  onChange={(e) => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) })}
                  className="block w-full pr-8"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  %
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('products.status')}
            </label>
            <div className="flex space-x-4">
              {['active', 'draft', 'outOfStock'].map((status) => (
                <label key={status} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={status}
                    checked={formData.status === status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Product['status'] })}
                    className="form-radio text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {status === 'outOfStock'
                      ? t('products.status.outOfStock')
                      : t(`products.status.${status}`)}
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
              {t('dialog.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {product ? t('products.update') : t('products.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ProductManagement = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [storeId, setStoreId] = useState<string | null>(null);

  const categories = [
    { id: 'hot', label: t('products.category.hot'), icon: Flame },
    { id: 'frozen', label: t('products.category.frozen'), icon: Snowflake },
    { id: 'baked', label: t('products.category.baked'), icon: Cookie },
    { id: 'other', label: t('products.category.other'), icon: Package2 }
  ];

  useEffect(() => {
    if (!currentUser) return;
    fetchStoreId();
  }, [currentUser]);

  useEffect(() => {
    if (storeId) {
      loadProducts();
    }
  }, [storeId]);

  const fetchStoreId = async () => {
    if (!currentUser) return;
    
    try {
      const storesRef = collection(db, 'stores');
      const q = query(storesRef, where('ownerId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setStoreId(snapshot.docs[0].id);
      } else {
        setError('No store found. Please set up your store first.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error fetching store:', err);
      setError('Failed to fetch store information.');
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!storeId) return;
    
    try {
      setIsLoading(true);
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('storeId', '==', storeId)
      );
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsData);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
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

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (!currentUser || !storeId) return;

    try {
      if (productData.id) {
        const productRef = doc(db, 'products', productData.id);
        await updateDoc(productRef, productData);
        setProducts(prev => prev.map(p => 
          p.id === productData.id ? { ...p, ...productData } as Product : p
        ));
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...productData,
          storeId: storeId,
          ownerId: currentUser.uid,
          createdAt: new Date()
        });
        const newProduct = {
          id: docRef.id,
          ...productData,
          storeId: storeId,
          ownerId: currentUser.uid
        } as Product;
        setProducts(prev => [...prev, newProduct]);
      }
    } catch (err) {
      console.error('Error saving product:', err);
      throw new Error('Failed to save product');
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('products.title')}</h1>
          <p className="text-gray-600 mt-1">{t('products.subtitle')}</p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          disabled={!storeId}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg 
            hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('products.add')}
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('products.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    disabled={
                      (category.id === 'hot' && selectedCategories.includes('frozen')) ||
                      (category.id === 'frozen' && selectedCategories.includes('hot'))
                    }
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all
                      flex items-center space-x-2
                      ${selectedCategories.includes(category.id)
                        ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      ${((category.id === 'hot' && selectedCategories.includes('frozen')) ||
                         (category.id === 'frozen' && selectedCategories.includes('hot')))
                        ? 'opacity-50 cursor-not-allowed'
                        : ''}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-xl p-4 text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
          <div className="max-w-md mx-auto">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('products.noProducts')}</h3>
            <p className="text-gray-600 mb-6">
              {t('products.noProductsDesc')}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!storeId}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg 
                hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('products.addFirst')}
            </button>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className={`
                bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer
                ${viewMode === 'grid' 
                  ? 'rounded-xl'
                  : 'rounded-lg flex items-center p-4 space-x-4'}
              `}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-square relative">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`
                        px-2 py-1 rounded-full text-sm font-medium
                        ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 flex-shrink-0 relative rounded-lg overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">
                        +{product.images.length - 1}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                        {product.name}
                      </h3>
                      <span className={`
                        px-2 py-1 rounded-full text-sm font-medium flex-shrink-0
                        ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {product.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {product.description || 'No description available'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-gray-600">{product.category}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-primary-600 mr-1" />
                        <span className="font-semibold text-primary-600">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Boxes className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-gray-600">
                          {product.stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {storeId && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          product={selectedProduct || undefined}
          storeId={storeId}
        />
      )}
    </div>
  );
};