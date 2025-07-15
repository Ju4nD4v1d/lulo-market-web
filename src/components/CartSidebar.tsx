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
      setRedirectAfterLogin('#?checkout=true');
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
      
      {/* Enhanced Sidebar with Professional Animation */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out flex flex-col animate-in slide-in-from-right">
        {/* Enhanced Professional Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#C8E400] to-[#A3C700] rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('cart.title')}</h2>
              <p className="text-gray-500 text-sm">
                {cart.summary.itemCount} {cart.summary.itemCount === 1 ? t('cart.item') : t('cart.items')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {cart.items.length === 0 ? (
            /* Enhanced Empty Cart State */
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-6 max-w-sm">
                <div className="relative">
                  <div className="w-48 h-48 mx-auto">
                    <img 
                      src="https://undraw.co/api/illustrations/empty_cart"
                      alt="Empty cart illustration"
                      className="w-full h-full object-contain"
                      style={{ filter: 'hue-rotate(80deg) saturate(1.2) brightness(0.9)' }}
                      onError={(e) => {
                        // Fallback to custom illustration with brand colors
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-40 h-40 bg-gradient-to-br from-[#C8E400]/10 to-[#A3C700]/10 rounded-2xl mx-auto flex items-center justify-center border-2 border-[#C8E400]/20 relative">
                            <svg class="w-20 h-20 text-[#C8E400]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                            </svg>
                            <div class="absolute -top-2 -right-2 w-6 h-6 bg-[#C8E400] rounded-full flex items-center justify-center">
                              <span class="text-white text-xs font-bold">0</span>
                            </div>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">{t('cart.empty.title')}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t('cart.empty.description')}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
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

              {/* Enhanced Summary Section */}
              <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium flex-1">{t('cart.subtotal')}</span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap ml-2">CAD ${cart.summary.subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium flex-1">{t('cart.tax')}</span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap ml-2">CAD ${cart.summary.tax}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium flex-1">{t('cart.deliveryFee')}</span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap ml-2">CAD ${cart.summary.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium flex-1">{t('cart.platformFee')}</span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap ml-2">CAD ${cart.summary.platformFee}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-900 flex-1">{t('cart.total')}</span>
                    <span className="text-[#C8E400] text-xl whitespace-nowrap ml-2">CAD ${cart.summary.finalTotal}</span>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="space-y-3">
                  {!currentUser && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-2 text-blue-700 text-sm">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{t('cart.loginRequired')}</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleCheckout}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                      currentUser 
                        ? 'bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white shadow-lg' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    }`}
                  >
                    {currentUser ? t('cart.proceedToCheckout') : t('cart.signInToCheckout')}
                  </button>
                  
                  <button
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="w-full bg-gradient-to-r from-red-50 to-red-100 text-red-600 py-3 rounded-xl font-semibold border border-red-200 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 transition-all duration-300 disabled:opacity-50"
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
    <div className={`bg-white rounded-xl border border-gray-200 p-3 transition-all duration-300 ${isRemoving ? 'opacity-50 scale-95' : 'hover:shadow-md hover:border-[#C8E400]/30'}`}>
      <div className="flex gap-3">
        {/* Enhanced Product Image */}
        <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
          {item.product.images && item.product.images.length > 0 ? (
            <img 
              src={item.product.images[0]} 
              alt={item.product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Product Info - Compact Layout */}
        <div className="flex-1 min-w-0">
          {/* Enhanced Header Row: Name, Price, Remove Button */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 mr-3">
              <h4 className="font-bold text-gray-900 truncate text-sm leading-tight">{item.product.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-[#C8E400] text-base">CAD ${item.priceAtTime}</span>
                {item.priceAtTime !== item.product.price && (
                  <span className="text-xs text-gray-500 line-through">CAD ${item.product.price}</span>
                )}
              </div>
            </div>
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 flex-shrink-0"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Enhanced Bottom Row: Description and Quantity Controls */}
          <div className="space-y-2">
            {/* Description */}
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{item.product.description}</p>
            
            {/* Quantity Controls - Enhanced */}
            <div className="flex items-center justify-end">
              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <button 
                  onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <span className="px-3 py-2 font-bold text-gray-900 text-sm min-w-[2rem] text-center bg-white border-x border-gray-200">
                  {item.quantity}
                </span>
                <button 
                  onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Special Instructions */}
          {item.specialInstructions && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 italic leading-relaxed">{item.specialInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};