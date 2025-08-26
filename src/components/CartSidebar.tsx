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
  const [isLoading, setIsLoading] = useState(false);

  // Handle opening in checkout mode
  React.useEffect(() => {
    if (openInCheckoutMode && isOpen && currentUser && cart.items.length > 0) {
      setCurrentView('checkout');
    }
  }, [openInCheckoutMode, isOpen, currentUser, cart.items.length]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (newQuantity < 1) {
        await removeFromCart(itemId);
      } else {
        await updateQuantity(itemId, newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
    clearCart();
    setIsClearing(false);
  };

  const handleCheckout = async () => {
    if (isLoading) return;
    
    if (!currentUser) {
      // Set redirect to come back to the cart with checkout view
      setRedirectAfterLogin('#?checkout=true');
      window.location.hash = '#login';
      return;
    }
    
    setIsLoading(true);
    try {
      setCurrentView('checkout');
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
    } finally {
      setIsLoading(false);
    }
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
      <div className="fixed inset-0 z-50 overflow-y-auto">
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
      <div className="fixed inset-0 z-50 overflow-y-auto">
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
      
      {/* Professional Sidebar with Refined Design */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm sm:max-w-md bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out flex flex-col animate-in slide-in-from-right border-l border-gray-200">
        {/* Compact Professional Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{t('cart.title')}</h2>
              <p className="text-gray-600 text-xs font-medium">
                {cart.summary.itemCount} {cart.summary.itemCount === 1 ? t('cart.item') : t('cart.items')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="btn-ghost p-2"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {cart.items.length === 0 ? (
            /* Professional Empty Cart State */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-6 max-w-xs">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mx-auto flex items-center justify-center border border-gray-200 shadow-sm">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{t('cart.empty.title')}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t('cart.empty.description')}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="bg-primary-400 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary-500 transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  {t('cart.empty.startShopping')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Store Info Banner */}
              {cart.storeName && (
                <div className="bg-gradient-to-r from-primary-400/10 to-primary-400/5 border-b border-primary-400/20 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary-400 rounded-lg flex items-center justify-center">
                      <Store className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{cart.storeName}</p>
                      <p className="text-xs text-gray-600 font-medium">{t('cart.allItemsFrom')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
                {cart.items.map((item) => (
                  <CartItemCard 
                    key={item.id} 
                    item={item} 
                    onQuantityChange={handleQuantityChange}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              {/* Professional Summary Section */}
              <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium text-sm">{t('cart.subtotal')}</span>
                    <span className="font-semibold text-gray-900">CAD ${cart.summary.subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium text-sm">{t('cart.tax')}</span>
                    <span className="font-semibold text-gray-900">CAD ${cart.summary.tax}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium text-sm">{t('cart.deliveryFee')}</span>
                    <span className="font-semibold text-gray-900">CAD ${cart.summary.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium text-sm">{t('cart.platformFee')}</span>
                    <span className="font-semibold text-gray-900">CAD ${cart.summary.platformFee}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                    <span className="text-gray-900 font-bold text-base">{t('cart.total')}</span>
                    <span className="text-primary-400 font-bold text-lg">CAD ${cart.summary.finalTotal}</span>
                  </div>
                </div>

                {/* Professional Action Buttons */}
                <div className="space-y-3">
                  {!currentUser && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3">
                      <div className="flex items-center gap-2.5 text-blue-800">
                        <User className="w-4 h-4" />
                        <span className="font-semibold text-sm">{t('cart.loginRequired')}</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading || isClearing}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                      currentUser 
                        ? 'bg-primary-400 text-white hover:bg-primary-500 hover:shadow-lg' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        {t('cart.loading')}
                      </div>
                    ) : (
                      currentUser ? t('cart.proceedToCheckout') : t('cart.signInToCheckout')
                    )}
                  </button>
                  
                  <button
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="w-full bg-gradient-to-r from-red-50 to-red-100 text-red-700 py-2.5 rounded-xl font-semibold text-sm border border-red-200 hover:from-red-100 hover:to-red-200 transition-all duration-200 disabled:opacity-50"
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
    <div className={`bg-white rounded-xl border border-gray-200 p-4 transition-all duration-300 shadow-sm ${isRemoving ? 'opacity-50 scale-95' : 'hover:border-gray-300 hover:shadow-md'}`}>
      <div className="flex gap-4">
        {/* Professional Product Image */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm">
          {item.product.images && item.product.images.length > 0 ? (
            <img 
              src={item.product.images[0]} 
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Product Info - Enhanced Layout */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Name and Remove Button */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 mr-3">
              <h4 className="font-semibold text-gray-900 truncate text-base leading-tight">{item.product.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-primary-400 text-base">CAD ${item.priceAtTime}</span>
                {item.priceAtTime !== item.product.price && (
                  <span className="text-sm text-gray-500 line-through">CAD ${item.product.price}</span>
                )}
              </div>
            </div>
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="p-2.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 flex-shrink-0 touch-manipulation"
              title="Remove item"
              style={{ minHeight: '44px' }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{item.product.description}</p>
          
          {/* Quantity Controls - Mobile-Optimized */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                className="p-2.5 sm:p-2 hover:bg-gray-100 transition-colors active:bg-gray-200 touch-manipulation disabled:opacity-50"
                style={{ minHeight: '44px' }}
                disabled={isRemoving}
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-3 sm:px-4 py-2 font-bold text-gray-900 text-base min-w-[2.5rem] sm:min-w-[3rem] text-center bg-white border-x border-gray-200">
                {item.quantity}
              </span>
              <button 
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                className="p-2.5 sm:p-2 hover:bg-gray-100 transition-colors active:bg-gray-200 touch-manipulation disabled:opacity-50"
                style={{ minHeight: '44px' }}
                disabled={isRemoving}
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="text-right">
              <span className="text-xs sm:text-sm text-gray-600">Total:</span>
              <p className="font-bold text-primary-400 text-base sm:text-lg">CAD ${(item.priceAtTime * item.quantity).toFixed(2)}</p>
            </div>
          </div>

          {/* Special Instructions */}
          {item.specialInstructions && (
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium italic">{item.specialInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
