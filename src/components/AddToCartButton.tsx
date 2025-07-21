import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check, AlertTriangle } from 'lucide-react';
import { Product } from '../types/product';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface AddToCartButtonProps {
  product: Product;
  storeId?: string;
  storeName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'minimal';
  showQuantityControls?: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  storeId,
  storeName,
  className = '',
  size = 'md',
  variant = 'primary',
  showQuantityControls = false
}) => {
  const { cart, addToCart, canAddToCart } = useCart();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showStoreWarning, setShowStoreWarning] = useState(false);

  const targetStoreId = storeId || product.storeId;
  const canAdd = canAddToCart(targetStoreId || '');
  
  // Check product availability
  const isAvailable = product.available !== false && product.status === 'active' && (product.stock || 0) > 0;
  
  // Check if product is already in cart
  const existingItem = cart.items.find(item => item.product.id === product.id);
  const currentQuantityInCart = existingItem?.quantity || 0;

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleAddToCart = async () => {
    if (!targetStoreId) {
      console.error('Store ID required to add to cart');
      return;
    }

    if (!canAdd) {
      setShowStoreWarning(true);
      setTimeout(() => setShowStoreWarning(false), 3000);
      return;
    }

    setIsAdding(true);
    
    try {
      addToCart(product, quantity, targetStoreId, storeName);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 99)); // Max 99 items
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1)); // Min 1 item
  };

  // Warning message when trying to add from different store
  if (showStoreWarning) {
    return (
      <div className={`flex items-center gap-2 ${sizeClasses[size]} bg-red-50 border border-red-200 rounded-xl text-red-700 ${className}`}>
        <AlertTriangle className={iconSizes[size]} />
        <span className="font-medium text-sm">{t('cart.differentStoreInCart')}</span>
      </div>
    );
  }

  // Success state
  if (showSuccess) {
    return (
      <div className={`flex items-center justify-center gap-2 ${sizeClasses[size]} bg-green-100 border border-green-200 rounded-xl text-green-700 ${className}`}>
        <Check className={iconSizes[size]} />
        <span className="font-semibold">{t('cart.addedToCart')}</span>
      </div>
    );
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300';
      case 'minimal':
        return 'bg-transparent hover:bg-gray-50 text-gray-600 border border-gray-300';
      case 'primary':
      default:
        return 'bg-[#C8E400] hover:bg-[#A3C700] text-gray-900 shadow-lg hover:shadow-xl';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Quantity Controls */}
      {showQuantityControls && (
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="p-2 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <span className="px-3 py-2 font-semibold text-gray-900 min-w-[2.5rem] text-center">
            {quantity}
          </span>
          <button
            onClick={incrementQuantity}
            disabled={quantity >= 99}
            className="p-2 hover:bg-gray-100 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding || !isAvailable}
        className={`
          ${sizeClasses[size]} 
          ${getVariantClasses()}
          flex items-center justify-center gap-1 rounded-lg font-medium min-w-0 w-full
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-[#C8E400]/30
          ${!canAdd ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={!isAvailable ? t('cart.productNotAvailable') : !canAdd ? t('cart.clearCartDifferentStore') : t('cart.addToCart')}
      >
        {isAdding ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>{t('cart.adding')}</span>
          </>
        ) : (
          <>
            <ShoppingCart className={iconSizes[size]} />
            <span className="truncate">
              {currentQuantityInCart > 0 
                ? `+${currentQuantityInCart}` 
                : showQuantityControls && quantity > 1
                ? `+${quantity}`
                : size === 'sm' ? '+' : t('cart.addToCart')
              }
            </span>
            {!showQuantityControls && quantity > 1 && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                {quantity}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};