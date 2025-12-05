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
  /** The commission rate override (null = using default from Firestore config) */
  commissionRateOverride: number | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; storeId: string; storeName: string; storeImage?: string } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'SET_DELIVERY_FEE'; payload: number }
  | { type: 'SET_PLATFORM_FEE'; payload: number }
  | { type: 'SET_COMMISSION_RATE'; payload: number };

const TAX_RATE = 0.12; // 12% tax rate (HST in BC, Canada)

/**
 * Calculate cart summary with optional fee overrides and payment split.
 *
 * Payment Split (Stripe Connect):
 * - Customer pays: subtotal + tax + deliveryFee + platformFee
 * - Lulocart keeps: (subtotal × commissionRate) + deliveryFee + platformFee
 * - Store receives: (subtotal × (1 - commissionRate)) + tax
 */
const calculateSummary = (
  items: CartItem[],
  deliveryFeeOverride?: number | null,
  platformFeeOverride?: number | null,
  commissionRateOverride?: number | null
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

  // Commission calculation (Stripe Connect payment split)
  const commissionRate = commissionRateOverride ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate;
  const commissionAmount = subtotal * commissionRate;
  // Store gets: (subtotal × (1 - rate)) + 100% of tax
  const storeAmount = (subtotal * (1 - commissionRate)) + tax;
  // Lulocart keeps: commission + 100% of delivery fee + platform fee
  const lulocartAmount = commissionAmount + deliveryFee + platformFee;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    deliveryFee: Number(deliveryFee.toFixed(2)),
    total: Number(total.toFixed(2)),
    platformFee: Number(platformFee.toFixed(2)),
    finalTotal: Number(finalTotal.toFixed(2)),
    itemCount,
    // Payment split fields
    commissionRate,
    commissionAmount: Number(commissionAmount.toFixed(2)),
    storeAmount: Number(storeAmount.toFixed(2)),
    lulocartAmount: Number(lulocartAmount.toFixed(2)),
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
    itemCount: 0,
    // Payment split fields (default values)
    commissionRate: DEFAULT_PLATFORM_FEE_CONFIG.commissionRate,
    commissionAmount: 0,
    storeAmount: 0,
    lulocartAmount: 0,
  },
  // Configured fees from Firestore (null = not yet loaded)
  configuredPlatformFee: null,
  configuredCommissionRate: null,
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
          summary: calculateSummary(
            newItems,
            state.summary.deliveryFee,
            state.configuredPlatformFee ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
            state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate
          )
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
        summary: calculateSummary(
          newItems,
          state.summary.deliveryFee,
          state.configuredPlatformFee ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
          state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate
        )
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
        summary: calculateSummary(
          newItems,
          state.summary.deliveryFee,
          state.configuredPlatformFee ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
          state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate
        )
      };
    }

    case 'CLEAR_CART': {
      // Clear cart items but PRESERVE Firestore config values
      // (platformFee and commissionRate don't change when cart is cleared)
      return {
        ...initialState,
        configuredPlatformFee: state.configuredPlatformFee,
        configuredCommissionRate: state.configuredCommissionRate,
      };
    }

    case 'LOAD_CART': {
      return action.payload;
    }

    case 'SET_DELIVERY_FEE': {
      // Recalculate summary with the new delivery fee, using configured fees
      return {
        ...state,
        summary: calculateSummary(
          state.items,
          action.payload,
          state.configuredPlatformFee ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
          state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate
        )
      };
    }

    case 'SET_PLATFORM_FEE': {
      // Store the configured value and recalculate summary
      const newSummary = calculateSummary(
        state.items,
        state.summary.deliveryFee,
        action.payload,
        state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate
      );
      return {
        ...state,
        configuredPlatformFee: action.payload,
        summary: newSummary
      };
    }

    case 'SET_COMMISSION_RATE': {
      // Store the configured value and recalculate summary
      return {
        ...state,
        configuredCommissionRate: action.payload,
        summary: calculateSummary(
          state.items,
          state.summary.deliveryFee,
          state.configuredPlatformFee ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
          action.payload
        )
      };
    }

    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Lazy initializer for cart - loads from localStorage BEFORE first render
 *
 * NOTE: This loads the cart structure from localStorage but does NOT use
 * the saved platformFee/commissionRate values. Instead, the useEffect in
 * CartProvider fetches fresh values from Firestore and dispatches updates.
 * This ensures the cart always uses the latest config from Firestore.
 */
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
  // Commission rate override - null means "using default" (fetched from Firestore config)
  const [commissionRateOverride, setCommissionRateOverrideState] = useState<number | null>(null);

  // Track previous values to prevent unnecessary updates
  const prevPlatformFeeRef = useRef<number | null>(null);
  const prevCommissionRateRef = useRef<number | null>(null);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('lulo-cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch platform fee config (including commission rate) from Firestore on mount
  useEffect(() => {
    let isCancelled = false;

    const fetchPlatformFeeConfig = async () => {
      try {
        const config = await getPlatformFeeConfig();

        const fee = config.enabled ? config.fixedAmount : 0;
        const commissionRate = config.commissionRate;

        if (!isCancelled) {
          // Always update fees from Firestore to ensure cart uses latest values
          // (localStorage may have stale values from previous session)
          setPlatformFeeOverrideState(fee);
          dispatch({ type: 'SET_PLATFORM_FEE', payload: fee });
          prevPlatformFeeRef.current = fee;

          setCommissionRateOverrideState(commissionRate);
          dispatch({ type: 'SET_COMMISSION_RATE', payload: commissionRate });
          prevCommissionRateRef.current = commissionRate;
        }
      } catch (error) {
        console.error('Error fetching platform fee config:', error);
      }
    };

    fetchPlatformFeeConfig();

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
    // Only reset delivery fee (distance-based, changes per order)
    // Keep platform fee and commission rate (from Firestore config, doesn't change per order)
    setDeliveryFeeOverrideState(null);
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
    commissionRateOverride,
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