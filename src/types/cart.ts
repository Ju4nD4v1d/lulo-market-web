import { Product } from './product';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedOptions?: string[]; // For product customizations/options
  specialInstructions?: string;
  priceAtTime: number; // Price when added to cart (in case product price changes)
  // Enhanced: Receipt fields
  itemModifications?: string[]; // List of modifications/customizations
  itemNotes?: string; // Additional notes for this specific item
  addedAt?: Date; // When item was added to cart
}

export interface CartSummary {
  subtotal: number;
  tax: number; // Total tax (gst + pst) - kept for backward compatibility
  gst: number; // GST calculated from product gstPercentage
  pst: number; // PST calculated from product pstPercentage
  deliveryFee: number;
  total: number; // Base total before platform fee (subtotal + tax + deliveryFee)
  platformFee: number; // Fixed platform fee charged to customer (from Firestore config)
  finalTotal: number; // Total amount customer pays (total + platformFee)
  itemCount: number;

  // Payment split fields (Stripe Connect)
  commissionRate: number; // Commission rate as decimal (e.g., 0.06 for 6%)
  commissionAmount: number; // subtotal * commissionRate - Lulocart's commission
  storeAmount: number; // (subtotal * (1 - commissionRate)) + tax - what store receives
  lulocartAmount: number; // commissionAmount + deliveryFee + platformFee - what Lulocart keeps

  // Enhanced: Receipt fields
  discountAmount?: number; // Amount discounted from promotional codes
  tipAmount?: number; // Customer tip amount
  serviceFee?: number; // Additional service fees
  appliedPromoCodes?: string[]; // Applied promotional codes

  // New customer delivery fee discount (first 3 orders)
  deliveryFeeDiscount?: {
    originalFee: number; // Original delivery fee before discount
    discountedFee: number; // Discounted delivery fee
    discountAmount: number; // Amount saved
    isEligible: boolean; // Whether discount was applied
    ordersRemaining: number; // Discounted orders remaining (0-3)
  };
}

export interface CartState {
  items: CartItem[];
  storeId: string | null; // Cart can only contain items from one store
  storeSlug: string | null; // Store slug for URL-friendly navigation
  storeName: string | null;
  storeImage: string | null; // Store image URL for display in cart
  summary: CartSummary;
  // Configured fees from Firestore (persist even when cart is empty)
  configuredPlatformFee?: number | null;
  configuredCommissionRate?: number | null;
}

// Alias for backward compatibility
export type Cart = CartState;