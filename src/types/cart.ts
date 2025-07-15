import { Product } from './product';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedOptions?: string[]; // For product customizations/options
  specialInstructions?: string;
  priceAtTime: number; // Price when added to cart (in case product price changes)
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number; // Base total before platform fee
  platformFee: number; // 2 CAD platform fee charged to customer
  finalTotal: number; // Total amount customer pays (total + platformFee)
  itemCount: number;
}

export interface CartState {
  items: CartItem[];
  storeId: string | null; // Cart can only contain items from one store
  storeName: string | null;
  summary: CartSummary;
}