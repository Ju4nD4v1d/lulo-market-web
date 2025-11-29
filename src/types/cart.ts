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
  tax: number;
  deliveryFee: number;
  total: number; // Base total before platform fee
  platformFee: number; // 2 CAD platform fee charged to customer
  finalTotal: number; // Total amount customer pays (total + platformFee)
  itemCount: number;
  // Enhanced: Receipt fields
  discountAmount?: number; // Amount discounted from promotional codes
  tipAmount?: number; // Customer tip amount
  serviceFee?: number; // Additional service fees
  taxBreakdown?: {
    gst: number; // 5% GST
    pst: number; // 7% PST
    hst?: number; // HST if applicable
  };
  appliedPromoCodes?: string[]; // Applied promotional codes
}

export interface CartState {
  items: CartItem[];
  storeId: string | null; // Cart can only contain items from one store
  storeName: string | null;
  storeImage: string | null; // Store image URL for display in cart
  summary: CartSummary;
}