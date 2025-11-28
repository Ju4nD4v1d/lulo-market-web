import type * as React from 'react';
import { useState } from 'react';
import { ArrowLeft, Edit, Package, DollarSign, Boxes, AlertCircle, Flame, Snowflake, Cookie, Package2, List, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import { COMMON_ALLERGENS } from '../../../../../constants/allergens';
import styles from './ProductDetails.module.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: 'active' | 'draft' | 'outOfStock';
  images: string[];
  pstPercentage?: number;
  gstPercentage?: number;
  ingredients?: {
    main: string[];
    contains?: string[];
  };
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onEdit: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onEdit }) => {
  const { t } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const totalTaxPercentage = (product.pstPercentage || 0) + (product.gstPercentage || 0);
  const taxAmount = (product.price * totalTaxPercentage) / 100;
  const totalPrice = product.price + taxAmount;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hot':
        return <Flame className="w-5 h-5 text-primary-400" />;
      case 'frozen':
        return <Snowflake className="w-5 h-5 text-primary-400" />;
      case 'baked':
        return <Cookie className="w-5 h-5 text-primary-400" />;
      default:
        return <Package2 className="w-5 h-5 text-primary-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'outOfStock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('products.status.active');
      case 'draft':
        return t('products.status.draft');
      case 'outOfStock':
        return t('products.status.outOfStock');
      default:
        return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'hot':
        return t('products.category.hot');
      case 'frozen':
        return t('products.category.frozen');
      case 'baked':
        return t('products.category.baked');
      case 'other':
        return t('products.category.other');
      default:
        return category;
    }
  };

  const isLowStock = product.stock < 10;

  // Check if product has ingredients data
  const hasIngredients = product.ingredients?.main && product.ingredients.main.length > 0;
  const hasAllergens = product.ingredients?.contains && product.ingredients.contains.length > 0;

  // Get allergen label from translation
  const getAllergenLabel = (allergenId: string) => {
    const allergen = COMMON_ALLERGENS.find(a => a.id === allergenId);
    return allergen ? t(allergen.translationKey) : allergenId;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="btn-ghost flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('products.back')}
            </button>
            <button
              onClick={onEdit}
              className="btn-primary inline-flex items-center gap-2 font-semibold"
            >
              <Edit className="w-5 h-5 mr-2" />
              {t('products.edit')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                      {selectedImageIndex + 1} / {product.images.length}
                    </div>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`
                          relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                          ${selectedImageIndex === index ? 'border-primary-400 ring-2 ring-primary-400/20' : 'border-gray-200 hover:border-gray-300'}
                        `}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <span className="text-gray-500 text-lg">{t('products.noImage')}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>
                    <div className="flex items-center gap-1 px-3 py-1 bg-primary-400/10 rounded-full">
                      {getCategoryIcon(product.category)}
                      <span className="text-sm font-medium text-primary-700">
                        {getCategoryText(product.category)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {product.description && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('products.description')}</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                </div>
              )}
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary-400" />
                {t('products.pricingStock')}
              </h3>

              <div className="space-y-4">
                {/* Base Price */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('products.basePrice')}</span>
                  <span className="text-2xl font-bold text-primary-400">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {/* Tax Breakdown - Only show if there are taxes */}
                {((product.pstPercentage ?? 0) > 0 || (product.gstPercentage ?? 0) > 0) && (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    {(product.pstPercentage ?? 0) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{t('products.pst')} ({product.pstPercentage}%)</span>
                        <span className="text-gray-700">
                          +${((product.price * (product.pstPercentage ?? 0)) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {(product.gstPercentage ?? 0) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{t('products.gst')} ({product.gstPercentage}%)</span>
                        <span className="text-gray-700">
                          +${((product.price * (product.gstPercentage ?? 0)) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-800 font-medium">{t('products.totalWithTax')}</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Stock */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-primary-400" />
                    <span className="text-gray-600">{t('products.stock')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {product.stock} {t('products.units')}
                    </span>
                    {isLowStock && product.stock > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {t('products.lowStock')}
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {t('products.outOfStock')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients Section - Only shown if product has ingredients */}
            {(hasIngredients || hasAllergens) && (
              <div className={styles.ingredientsCard}>
                <h3 className={styles.cardTitle}>
                  <List className={styles.cardIcon} />
                  {t('products.ingredients')}
                </h3>

                {hasIngredients && (
                  <div className={styles.ingredientsList}>
                    {product.ingredients!.main.map((ingredient, index) => (
                      <div key={index} className={styles.ingredientItem}>
                        <span className={styles.ingredientBullet} />
                        {ingredient}
                      </div>
                    ))}
                  </div>
                )}

                {hasAllergens && (
                  <div className={styles.allergensWarning}>
                    <AlertTriangle className={styles.warningIcon} />
                    <div className={styles.allergensContent}>
                      <span className={styles.allergensLabel}>{t('productDetails.contains')}:</span>
                      <span className={styles.allergensList}>
                        {product.ingredients!.contains!.map(id => getAllergenLabel(id)).join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
