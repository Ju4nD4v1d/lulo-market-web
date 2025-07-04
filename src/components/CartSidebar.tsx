import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus, Trash2, Store, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CartItem } from '../types/cart';
import { CheckoutForm } from './CheckoutForm';
import { OrderConfirmation } from './OrderConfirmation';
import { Order } from '../types/order';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  openInCheckoutMode?: boolean;
}

type CartView = 'cart' | 'checkout' | 'confirmation';

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, openInCheckoutMode = false }) => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { t } = useLanguage();
  const { currentUser, setRedirectAfterLogin } = useAuth();
  const [isClearing, setIsClearing] = useState(false);
  const [currentView, setCurrentView] = useState<CartView>('cart');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Handle opening in checkout mode
  React.useEffect(() => {
    if (openInCheckoutMode && isOpen && currentUser && cart.items.length > 0) {
      setCurrentView('checkout');
    }
  }, [openInCheckoutMode, isOpen, currentUser, cart.items.length]);

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
    if (!currentUser) {
      // Set redirect to come back to the cart with checkout view
      setRedirectAfterLogin('#shopper-dashboard?checkout=true');
      window.location.hash = '#login';
      return;
    }
    setCurrentView('checkout');
  };

  const handleBackToCart = () => {
    setCurrentView('cart');
  };

  const handleOrderComplete = (order: Order) => {
    setCompletedOrder(order);
    setCurrentView('confirmation');
  };

  const handleBackToShopping = () => {
    setCurrentView('cart');
    setCompletedOrder(null);
    onClose();
  };

  const handleClose = () => {
    setCurrentView('cart');
    setCompletedOrder(null);
    onClose();
  };

  if (!isOpen) return null;

  // Render checkout form as full-screen modal
  if (currentView === 'checkout') {
    return (
      <div className="fixed inset-0 z-50">
        <CheckoutForm 
          onBack={handleBackToCart}
          onOrderComplete={handleOrderComplete}
        />
      </div>
    );
  }

  // Render order confirmation as full-screen modal
  if (currentView === 'confirmation' && completedOrder) {
    return (
      <div className="fixed inset-0 z-50">
        <OrderConfirmation 
          order={completedOrder}
          onBackToShopping={handleBackToShopping}
        />
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={handleClose}
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
            onClick={handleClose}
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
                  onClick={handleClose}
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
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                  {!currentUser && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-2 text-blue-700 text-sm">
                        <User className="w-4 h-4" />
                        <span>{t('cart.loginRequired')}</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleCheckout}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                      currentUser 
                        ? 'bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white hover:shadow-lg' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                    }`}
                  >
                    {currentUser ? t('cart.proceedToCheckout') : t('cart.signInToCheckout')}
                  </button>
                  
                  <button
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {isClearing ? t('cart.clearing') : t('cart.clearCart')}
                  </button>
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
    <div className={`bg-white rounded-lg border border-gray-200 p-2.5 transition-all duration-300 ${isRemoving ? 'opacity-50 scale-95' : 'hover:shadow-sm'}`}>
      <div className="flex gap-2.5">
        {/* Product Image - Smaller */}
        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {item.product.images && item.product.images.length > 0 ? (
            <img 
              src={item.product.images[0]} 
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-lg">🍽️</span>
            </div>
          )}
        </div>

        {/* Product Info - Compact Layout */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Name, Price, Remove Button */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0 mr-2">
              <h4 className="font-semibold text-gray-900 truncate text-sm leading-tight">{item.product.name}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-[#C8E400] text-sm">CAD ${item.priceAtTime}</span>
                {item.priceAtTime !== item.product.price && (
                  <span className="text-xs text-gray-500 line-through">CAD ${item.product.price}</span>
                )}
              </div>
            </div>
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 flex-shrink-0"
              title="Remove item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Row: Quantity Controls */}
          <div className="flex items-center justify-between">
            {/* Description - Truncated */}
            <p className="text-xs text-gray-500 truncate flex-1 mr-2">{item.product.description}</p>
            
            {/* Quantity Controls - Compact */}
            <div className="flex items-center bg-gray-50 rounded border border-gray-200 flex-shrink-0">
              <button 
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                className="p-1 hover:bg-gray-100 rounded-l transition-colors"
              >
                <Minus className="w-3 h-3 text-gray-600" />
              </button>
              <span className="px-2 py-1 font-semibold text-gray-900 text-xs min-w-[1.5rem] text-center">
                {item.quantity}
              </span>
              <button 
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                className="p-1 hover:bg-gray-100 rounded-r transition-colors"
              >
                <Plus className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Special Instructions - Compact */}
          {item.specialInstructions && (
            <div className="mt-1.5 p-1.5 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-600 italic">{item.specialInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};