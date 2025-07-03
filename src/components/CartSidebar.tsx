import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus, Trash2, Store, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { CartItem } from '../types/cart';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { t } = useLanguage();
  const [isClearing, setIsClearing] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
    clearCart();
    setIsClearing(false);
  };

  const handleCheckout = () => {
    // TODO: Navigate to checkout page
    console.log('Proceeding to checkout...');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{t('cart.title')}</h2>
              <p className="text-white/90 text-sm">
                {cart.summary.itemCount} {cart.summary.itemCount === 1 ? t('cart.item') : t('cart.items')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {cart.items.length === 0 ? (
            /* Empty Cart State */
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('cart.empty.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('cart.empty.description')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  {t('cart.empty.startShopping')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Store Info */}
              {cart.storeName && (
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-[#C8E400]" />
                    <div>
                      <p className="font-semibold text-gray-900">{cart.storeName}</p>
                      <p className="text-sm text-gray-600">{t('cart.allItemsFrom')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.items.map((item) => (
                  <CartItemCard 
                    key={item.id} 
                    item={item} 
                    onQuantityChange={handleQuantityChange}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              {/* Summary Section */}
              <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.subtotal')}</span>
                    <span className="font-medium">CAD ${cart.summary.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.tax')}</span>
                    <span className="font-medium">CAD ${cart.summary.tax}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.deliveryFee')}</span>
                    <span className="font-medium">CAD ${cart.summary.deliveryFee}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold">
                    <span>{t('cart.total')}</span>
                    <span className="text-[#C8E400]">CAD ${cart.summary.total}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {t('cart.proceedToCheckout')}
                  </button>
                  
                  <button
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {isClearing ? t('cart.clearing') : t('cart.clearCart')}
                  </button>
                </div>

                {/* Estimated Delivery Time */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-2">
                  <Clock className="w-4 h-4" />
                  <span>{t('cart.estimatedDelivery')}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, onQuantityChange, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Animation delay
    onRemove(item.id);
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 transition-all duration-300 ${isRemoving ? 'opacity-50 scale-95' : 'hover:shadow-md'}`}>
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {item.product.images && item.product.images.length > 0 ? (
            <img 
              src={item.product.images[0]} 
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{item.product.name}</h4>
              <p className="text-sm text-gray-600 line-clamp-1">{item.product.description}</p>
            </div>
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Price and Quantity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#C8E400]">CAD ${item.priceAtTime}</span>
              {item.priceAtTime !== item.product.price && (
                <span className="text-xs text-gray-500 line-through">CAD ${item.product.price}</span>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200">
              <button 
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors"
              >
                <Minus className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <span className="px-3 py-1.5 font-semibold text-gray-900 min-w-[2rem] text-center text-sm">
                {item.quantity}
              </span>
              <button 
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Special Instructions */}
          {item.specialInstructions && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-medium">Special instructions:</p>
              <p className="text-xs text-blue-600">{item.specialInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};