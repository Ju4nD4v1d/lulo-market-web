import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, CartState, CartSummary } from '../types/cart';
import { Product } from '../types/product';

interface CartContextType {
  cart: CartState;
  addToCart: (product: Product, quantity?: number, storeId?: string, storeName?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartEmpty: boolean;
  canAddToCart: (storeId: string) => boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; storeId: string; storeName: string } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const TAX_RATE = 0.12; // 12% tax rate (HST in BC, Canada)
const DELIVERY_BASE_FEE = 4.99; // Base delivery fee
const PLATFORM_FEE = 2.00; // 2 CAD platform fee charged to customer

const calculateSummary = (items: CartItem[]): CartSummary => {
  const subtotal = items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const deliveryFee = items.length > 0 ? DELIVERY_BASE_FEE : 0;
  const total = subtotal + tax + deliveryFee; // Base total before platform fee
  const platformFee = items.length > 0 ? PLATFORM_FEE : 0; // Platform fee only if there are items
  const finalTotal = total + platformFee; // What customer actually pays
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    deliveryFee: Number(deliveryFee.toFixed(2)),
    total: Number(total.toFixed(2)),
    platformFee: Number(platformFee.toFixed(2)),
    finalTotal: Number(finalTotal.toFixed(2)),
    itemCount
  };
};

const initialState: CartState = {
  items: [],
  storeId: null,
  storeName: null,
  summary: {
    subtotal: 0,
    tax: 0,
    deliveryFee: 0,
    total: 0,
    platformFee: 0,
    finalTotal: 0,
    itemCount: 0
  }
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity, storeId, storeName } = action.payload;
      
      // If cart is empty or adding from same store, proceed
      if (!state.storeId || state.storeId === storeId) {
        // Check if item already exists in cart
        const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);
        
        let newItems: CartItem[];
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          newItems = state.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          const newCartItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity,
            priceAtTime: product.price
          };
          newItems = [...state.items, newCartItem];
        }

        return {
          ...state,
          items: newItems,
          storeId: storeId,
          storeName: storeName,
          summary: calculateSummary(newItems)
        };
      }
      
      // If trying to add from different store, don't add (handled in component)
      return state;
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.itemId);
      
      return {
        ...state,
        items: newItems,
        storeId: newItems.length === 0 ? null : state.storeId,
        storeName: newItems.length === 0 ? null : state.storeName,
        summary: calculateSummary(newItems)
      };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { itemId } });
      }
      
      const newItems = state.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );

      return {
        ...state,
        items: newItems,
        summary: calculateSummary(newItems)
      };
    }

    case 'CLEAR_CART': {
      return initialState;
    }

    case 'LOAD_CART': {
      return action.payload;
    }

    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('lulo-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('lulo-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity = 1, storeId?: string, storeName?: string) => {
    // Use product's storeId if not provided
    const targetStoreId = storeId || product.storeId;
    const targetStoreName = storeName || `Store ${targetStoreId}`;
    
    if (!targetStoreId) {
      console.error('Store ID is required to add items to cart');
      return;
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: { product, quantity, storeId: targetStoreId, storeName: targetStoreName }
    });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const canAddToCart = (storeId: string): boolean => {
    return !cart.storeId || cart.storeId === storeId;
  };

  const isCartEmpty = cart.items.length === 0;

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartEmpty,
    canAddToCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};