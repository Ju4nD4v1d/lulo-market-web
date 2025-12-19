import type * as React from 'react';
import { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { CartItem, CartState, CartSummary } from '../types/cart';
import { Product } from '../types/product';
import { DEFAULT_PLATFORM_FEE_CONFIG } from '../services/platformFee/constants';
import { getPlatformFeeConfig } from '../services/api/platformFeeConfigApi';
import { getProductById } from '../services/api/productApi';
import { DeliveryFeeDiscount } from '../types/deliveryFeeDiscount';

interface StoreInfo {
  storeId: string;
  storeSlug?: string;
  storeName?: string;
  storeImage?: string;
}

// Re-export for backward compatibility
export type { DeliveryFeeDiscount as DeliveryFeeDiscountData } from '../types/deliveryFeeDiscount';

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
  /** Set the delivery fee discount for new customers (first 3 orders) */
  setDeliveryFeeDiscount: (discount: DeliveryFeeDiscount | null) => void;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; storeId: string; storeSlug: string; storeName: string; storeImage?: string } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'SET_DELIVERY_FEE'; payload: number }
  | { type: 'SET_PLATFORM_FEE'; payload: number }
  | { type: 'SET_COMMISSION_RATE'; payload: number }
  | { type: 'REFRESH_PRODUCTS'; payload: { updatedItems: CartItem[]; removedProductIds: string[] } }
  | { type: 'SET_DELIVERY_FEE_DISCOUNT'; payload: DeliveryFeeDiscount | null };

/**
 * Calculate cart summary with optional fee overrides and payment split.
 * Tax is calculated per-product using gstPercentage and pstPercentage from product data.
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
  commissionRateOverride?: number | null,
  existingDeliveryFeeDiscount?: CartSummary['deliveryFeeDiscount']
): CartSummary => {
  const subtotal = items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);

  // Calculate GST and PST per-product based on product tax percentages
  let gst = 0;
  let pst = 0;

  items.forEach(item => {
    const itemTotal = item.priceAtTime * item.quantity;
    const gstRate = (item.product.gstPercentage ?? 0) / 100; // Convert percentage to decimal
    const pstRate = (item.product.pstPercentage ?? 0) / 100; // Convert percentage to decimal
    gst += itemTotal * gstRate;
    pst += itemTotal * pstRate;
  });

  const tax = gst + pst; // Total tax is sum of GST and PST

  // Use override if provided, otherwise 0 (fee calculated at checkout)
  const deliveryFee = items.length > 0 ? (deliveryFeeOverride ?? 0) : 0;

  // Apply delivery fee discount if eligible
  const effectiveDeliveryFee = existingDeliveryFeeDiscount?.isEligible
    ? existingDeliveryFeeDiscount.discountedFee
    : deliveryFee;

  const total = subtotal + tax + effectiveDeliveryFee; // Base total before platform fee
  // Use platform fee override if provided, otherwise use default from Firestore config
  const platformFee = items.length > 0 ? (platformFeeOverride ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount) : 0;
  const finalTotal = total + platformFee; // What customer actually pays
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Commission calculation (Stripe Connect payment split)
  const commissionRate = commissionRateOverride ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate;
  const commissionAmount = subtotal * commissionRate;
  // Store gets: (subtotal × (1 - rate)) + 100% of tax
  const storeAmount = (subtotal * (1 - commissionRate)) + tax;
  // Lulocart keeps: commission + 100% of delivery fee (discounted if applicable) + platform fee
  const lulocartAmount = commissionAmount + effectiveDeliveryFee + platformFee;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    gst: Number(gst.toFixed(2)),
    pst: Number(pst.toFixed(2)),
    // Store effective delivery fee (discounted if applicable) - original fee is in deliveryFeeDiscount.originalFee
    deliveryFee: Number(effectiveDeliveryFee.toFixed(2)),
    total: Number(total.toFixed(2)),
    platformFee: Number(platformFee.toFixed(2)),
    finalTotal: Number(finalTotal.toFixed(2)),
    itemCount,
    // Payment split fields
    commissionRate,
    commissionAmount: Number(commissionAmount.toFixed(2)),
    storeAmount: Number(storeAmount.toFixed(2)),
    lulocartAmount: Number(lulocartAmount.toFixed(2)),
    // Preserve existing delivery fee discount if provided
    ...(existingDeliveryFeeDiscount && { deliveryFeeDiscount: existingDeliveryFeeDiscount }),
  };
};

const initialState: CartState = {
  items: [],
  storeId: null,
  storeSlug: null,
  storeName: null,
  storeImage: null,
  summary: {
    subtotal: 0,
    tax: 0,
    gst: 0,
    pst: 0,
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
      const { product, quantity, storeId, storeSlug, storeName, storeImage } = action.payload;

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
          storeSlug: storeSlug,
          storeName: storeName,
          storeImage: storeImage || state.storeImage, // Keep existing image if not provided
          summary: calculateSummary(
            newItems,
            state.summary.deliveryFee,
            state.configuredPlatformFee ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
            state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate,
            state.summary.deliveryFeeDiscount
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
        storeSlug: newItems.length === 0 ? null : state.storeSlug,
        storeName: newItems.length === 0 ? null : state.storeName,
        storeImage: newItems.length === 0 ? null : state.storeImage,
        summary: calculateSummary(
          newItems,
          state.summary.deliveryFee,
          state.configuredPlatformFee ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
          state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate,
          state.summary.deliveryFeeDiscount
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
          state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate,
          state.summary.deliveryFeeDiscount
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
      // Note: We preserve delivery fee discount here; it will be updated separately
      return {
        ...state,
        summary: calculateSummary(
          state.items,
          action.payload,
          state.configuredPlatformFee ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
          state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate,
          state.summary.deliveryFeeDiscount
        )
      };
    }

    case 'SET_PLATFORM_FEE': {
      // Store the configured value and recalculate summary
      const newSummary = calculateSummary(
        state.items,
        state.summary.deliveryFee,
        action.payload,
        state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate,
        state.summary.deliveryFeeDiscount
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
          action.payload,
          state.summary.deliveryFeeDiscount
        )
      };
    }

    case 'REFRESH_PRODUCTS': {
      // Update cart items with fresh product data from Firestore
      // Also removes items for products that no longer exist or are unavailable
      const { updatedItems, removedProductIds } = action.payload;

      // If all items were removed, clear the cart
      if (updatedItems.length === 0 && state.items.length > 0) {
        return {
          ...initialState,
          configuredPlatformFee: state.configuredPlatformFee,
          configuredCommissionRate: state.configuredCommissionRate,
        };
      }

      // Log removed products for debugging
      if (removedProductIds.length > 0) {
        console.info('Cart: Removed unavailable products:', removedProductIds);
      }

      return {
        ...state,
        items: updatedItems,
        storeId: updatedItems.length === 0 ? null : state.storeId,
        storeSlug: updatedItems.length === 0 ? null : state.storeSlug,
        storeName: updatedItems.length === 0 ? null : state.storeName,
        storeImage: updatedItems.length === 0 ? null : state.storeImage,
        summary: calculateSummary(
          updatedItems,
          state.summary.deliveryFee,
          state.configuredPlatformFee ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
          state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate,
          state.summary.deliveryFeeDiscount
        )
      };
    }

    case 'SET_DELIVERY_FEE_DISCOUNT': {
      // Set the delivery fee discount for new customers
      // IMPORTANT: Recalculate summary to update total/finalTotal with discounted delivery fee
      const discount = action.payload;
      // Use originalFee from discount (if available) to recalculate, otherwise use current deliveryFee
      const originalDeliveryFee = discount?.originalFee ?? state.summary.deliveryFee;
      return {
        ...state,
        summary: calculateSummary(
          state.items,
          originalDeliveryFee,
          state.configuredPlatformFee ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
          state.configuredCommissionRate ?? DEFAULT_PLATFORM_FEE_CONFIG.commissionRate,
          discount ?? undefined
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
        // Migration: Add storeSlug for old carts that don't have it
        // Falls back to storeId since getStoreByIdentifier will try ID lookup
        if (!parsed.storeSlug && parsed.storeId) {
          parsed.storeSlug = parsed.storeId;
        }
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

  // Refresh product data from Firestore on mount to prevent stale cart data
  // This ensures prices, tax percentages, and availability are always current
  useEffect(() => {
    let isCancelled = false;

    const refreshCartProducts = async () => {
      // Skip if cart is empty
      if (cart.items.length === 0) return;

      try {
        const updatedItems: CartItem[] = [];
        const removedProductIds: string[] = [];

        // Fetch fresh data for each product in parallel
        const productPromises = cart.items.map(async (item) => {
          try {
            const freshProduct = await getProductById(item.product.id);

            // Check if product is still active/available
            if (freshProduct.status !== 'active') {
              removedProductIds.push(item.product.id);
              return null;
            }

            // Return updated cart item with fresh product data and current price
            return {
              ...item,
              product: freshProduct,
              priceAtTime: freshProduct.price, // Update to current price
            };
          } catch (error) {
            // Product not found or error fetching - remove from cart
            console.warn(`Cart: Could not fetch product ${item.product.id}, removing from cart`);
            removedProductIds.push(item.product.id);
            return null;
          }
        });

        const results = await Promise.all(productPromises);

        // Filter out null results (removed products)
        results.forEach(item => {
          if (item !== null) {
            updatedItems.push(item);
          }
        });

        // Only dispatch if there are changes and component is still mounted
        if (!isCancelled) {
          const hasChanges = removedProductIds.length > 0 ||
            updatedItems.some((item, index) => {
              const original = cart.items[index];
              return !original ||
                item.priceAtTime !== original.priceAtTime ||
                item.product.gstPercentage !== original.product.gstPercentage ||
                item.product.pstPercentage !== original.product.pstPercentage;
            });

          if (hasChanges) {
            dispatch({
              type: 'REFRESH_PRODUCTS',
              payload: { updatedItems, removedProductIds }
            });
          }
        }
      } catch (error) {
        console.error('Error refreshing cart products:', error);
      }
    };

    refreshCartProducts();

    return () => {
      isCancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - cart.items intentionally excluded to prevent loops

  const addToCart = (product: Product, quantity = 1, storeInfo?: StoreInfo) => {
    // Use product's storeId if not provided
    const targetStoreId = storeInfo?.storeId || product.storeId;
    const targetStoreSlug = storeInfo?.storeSlug || targetStoreId; // Fallback to ID for backward compatibility
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
        storeSlug: targetStoreSlug,
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

  /**
   * Set the delivery fee discount for new customers (first 3 orders).
   * This updates the cart summary with discount information for display.
   */
  const setDeliveryFeeDiscount = useCallback((discount: DeliveryFeeDiscount | null) => {
    dispatch({ type: 'SET_DELIVERY_FEE_DISCOUNT', payload: discount });
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
    setDeliveryFeeDiscount,
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