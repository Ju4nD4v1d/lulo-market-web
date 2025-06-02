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
  Trash2,
  AlertTriangle,
  ChevronDown
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
  status: 'active' | 'draft' | 'outOfStock';
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  storeId: string;
}

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
  const [showFilters, setShowFilters] = useState(false);

  const loadProducts = async () => {
    if (!currentUser || !storeId) return;
    
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, where('storeId', '==', storeId));
      const productsSnapshot = await getDocs(productsQuery);
      
      const loadedProducts = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

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
          await loadProducts();
        }
      } catch (error) {
        console.error('Error loading store:', error);
        setLoading(false);
      }
    };

    loadStoreAndProducts();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedProduct && storeId) {
      loadProducts();
    }
  }, [selectedProduct, storeId]);

  const handleSaveProduct = async (productData: Partial<Product>) => {
    setIsModalOpen(false);
    await loadProducts();
  };

  const categories = ['all', 'food', 'drinks', 'snacks', 'desserts'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your store's products</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg 
            hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg md:hidden"
            >
              <span className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-gray-400" />
                Filters
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className={`
              md:flex md:items-center md:space-x-2
              ${showFilters ? 'block' : 'hidden md:block'}
            `}>
              <Filter className="hidden md:block text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 border border-gray-200 rounded-lg p-1">
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
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : products.length === 0 ? (
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
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`
                bg-white rounded-xl border border-gray-200 overflow-hidden
                transition-shadow hover:shadow-md cursor-pointer
                ${viewMode === 'list' ? 'flex' : ''}
              `}
              onClick={() => setSelectedProduct(product)}
            >
              <div className={`
                relative
                ${viewMode === 'list' ? 'w-32 sm:w-48' : 'w-full aspect-square'}
              `}>
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className={`
                  absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium
                  ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                    product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'}
                `}>
                  {product.status}
                </div>
              </div>

              <div className={`
                p-4
                ${viewMode === 'list' ? 'flex-1' : ''}
              `}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  </div>
                  <p className="text-lg font-semibold text-primary-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};