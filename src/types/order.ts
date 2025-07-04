export enum OrderStatus {
  PENDING = 'pending',
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
  total: number;
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
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentId?: string; // Stripe payment intent ID
  
  // Additional Information
  isDelivery: boolean; // true for delivery, false for pickup
  language: 'en' | 'es'; // Customer's preferred language
}