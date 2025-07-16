export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed', 
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  deliveryInstructions?: string;
}

export interface OrderSummary {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number; // Base total before platform fee
  platformFee: number; // 2 CAD platform fee charged to customer
  finalTotal: number; // Total amount customer pays (total + platformFee)
  storeAmount: number; // Amount that goes to store after platform fees
  platformAmount: number; // Amount that goes to platform (2 CAD + 10% of order)
  itemCount: number;
}

export interface Order {
  id: string;
  
  // Store Information
  storeId: string;
  storeName: string;
  
  // Customer Information
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  
  // Order Items
  items: OrderItem[];
  
  // Financial Information
  summary: OrderSummary;
  
  // Order Details
  status: OrderStatus;
  orderNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  estimatedDeliveryTime?: Date;
  deliveredAt?: Date;
  
  // Payment Information
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentId?: string; // Stripe payment intent ID
  stripeTransferId?: string; // Stripe transfer ID to store account
  platformTransactionFee?: number; // Actual Stripe processing fee
  
  // Additional Information
  isDelivery: boolean; // true for delivery, false for pickup
  language: 'en' | 'es'; // Customer's preferred language
}