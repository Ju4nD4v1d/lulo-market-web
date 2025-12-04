import type * as React from 'react';
import { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { CartItem, CartState, CartSummary } from '../types/cart';
import { Product } from '../types/product';
import { DEFAULT_PLATFORM_FEE_CONFIG } from '../services/platformFee/constants';
import { getPlatformFeeConfig } from '../services/api/platformFeeConfigApi';

interface StoreInfo {
  storeId: string;
  storeName?: string;
  storeImage?: string;
}

interface CartContextType {
  cart: CartState;
  addToCart: (product: Product, quantity?: number, storeInfo?: StoreInfo) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartEmpty: boolean;
  canAddToCart: (storeId: string) => boolean;
  /** Set the delivery fee (calculated dynamically at checkout) */
  setDeliveryFee: (fee: number) => void;
  /** The currently set delivery fee override (null = not yet calculated) */
  deliveryFeeOverride: number | null;
  /** Set the platform fee (fetched from Firestore config) */
  setPlatformFee: (fee: number) => void;
  /** The currently set platform fee override (null = using default) */
  platformFeeOverride: number | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; storeId: string; storeName: string; storeImage?: string } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'SET_DELIVERY_FEE'; payload: number }
  | { type: 'SET_PLATFORM_FEE'; payload: number };

const TAX_RATE = 0.12; // 12% tax rate (HST in BC, Canada)

/**
 * Calculate cart summary with optional fee overrides.
 * When deliveryFeeOverride is provided (from dynamic calculation), use it.
 * When platformFeeOverride is provided (from Firestore config), use it.
 * When null/undefined, fees use defaults or 0 (calculated at checkout).
 */
const calculateSummary = (
  items: CartItem[],
  deliveryFeeOverride?: number | null,
  platformFeeOverride?: number | null
): CartSummary => {
  const subtotal = items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  // Use override if provided, otherwise 0 (fee calculated at checkout)
  const deliveryFee = items.length > 0 ? (deliveryFeeOverride ?? 0) : 0;
  const total = subtotal + tax + deliveryFee; // Base total before platform fee
  // Use platform fee override if provided, otherwise use default from Firestore config
  const platformFee = items.length > 0 ? (platformFeeOverride ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount) : 0;
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
  storeImage: null,
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
      const { product, quantity, storeId, storeName, storeImage } = action.payload;

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
          storeImage: storeImage || state.storeImage, // Keep existing image if not provided
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
        storeImage: newItems.length === 0 ? null : state.storeImage,
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

    case 'SET_DELIVERY_FEE': {
      // Recalculate summary with the new delivery fee, preserving current platform fee
      return {
        ...state,
        summary: calculateSummary(state.items, action.payload, state.summary.platformFee)
      };
    }

    case 'SET_PLATFORM_FEE': {
      // Recalculate summary with the new platform fee, preserving current delivery fee
      return {
        ...state,
        summary: calculateSummary(state.items, state.summary.deliveryFee, action.payload)
      };
    }

    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Lazy initializer for cart - loads from localStorage BEFORE first render
// This prevents the race condition where save effect runs before load effect
const getInitialCart = (): CartState => {
  if (typeof window === 'undefined') return initialState;

  const savedCart = localStorage.getItem('lulo-cart');
  if (savedCart) {
    try {
      const parsed = JSON.parse(savedCart);
      // Validate basic structure
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
    }
  }
  return initialState;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use lazy initialization to load from localStorage before first render
  const [cart, dispatch] = useReducer(cartReducer, undefined, getInitialCart);

  // Delivery fee override - null means "not yet calculated" (shown as "Calculated at checkout")
  const [deliveryFeeOverride, setDeliveryFeeOverrideState] = useState<number | null>(null);
  // Platform fee override - null means "using default" (fetched from Firestore at checkout)
  const [platformFeeOverride, setPlatformFeeOverrideState] = useState<number | null>(null);

  // Track previous platform fee to prevent unnecessary updates
  const prevPlatformFeeRef = useRef<number | null>(null);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('lulo-cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch platform fee config from Firestore on mount
  useEffect(() => {
    let isCancelled = false;

    const fetchPlatformFee = async () => {
      try {
        const config = await getPlatformFeeConfig();
        const fee = config.enabled ? config.fixedAmount : 0;

        if (!isCancelled && prevPlatformFeeRef.current !== fee) {
          setPlatformFeeOverrideState(fee);
          dispatch({ type: 'SET_PLATFORM_FEE', payload: fee });
          prevPlatformFeeRef.current = fee;
        }
      } catch (error) {
        console.error('Error fetching platform fee config:', error);
      }
    };

    fetchPlatformFee();

    return () => {
      isCancelled = true;
    };
  }, []);

  const addToCart = (product: Product, quantity = 1, storeInfo?: StoreInfo) => {
    // Use product's storeId if not provided
    const targetStoreId = storeInfo?.storeId || product.storeId;
    const targetStoreName = storeInfo?.storeName || `Store ${targetStoreId}`;
    const targetStoreImage = storeInfo?.storeImage;

    if (!targetStoreId) {
      console.error('Store ID is required to add items to cart');
      return;
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product,
        quantity,
        storeId: targetStoreId,
        storeName: targetStoreName,
        storeImage: targetStoreImage
      }
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
    // Reset fees when cart is cleared
    setDeliveryFeeOverrideState(null);
    setPlatformFeeOverrideState(null);
  };

  /**
   * Set the delivery fee (calculated dynamically at checkout based on distance).
   * This updates both the local state and recalculates the cart summary.
   */
  const setDeliveryFee = useCallback((fee: number) => {
    setDeliveryFeeOverrideState(fee);
    dispatch({ type: 'SET_DELIVERY_FEE', payload: fee });
  }, []);

  /**
   * Set the platform fee (fetched from Firestore config at checkout).
   * This updates both the local state and recalculates the cart summary.
   */
  const setPlatformFee = useCallback((fee: number) => {
    setPlatformFeeOverrideState(fee);
    dispatch({ type: 'SET_PLATFORM_FEE', payload: fee });
  }, []);

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
    canAddToCart,
    setDeliveryFee,
    deliveryFeeOverride,
    setPlatformFee,
    platformFeeOverride,
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