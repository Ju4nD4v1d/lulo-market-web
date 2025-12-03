export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment', // Order created, awaiting payment
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  PAYMENT_FAILED = 'payment_failed' // Payment was attempted but failed
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productDescription?: string; // Enhanced: Product description for receipt
  productImage?: string;
  productImageUrl?: string; // Enhanced: High-res image URL for receipt
  price: number;
  quantity: number;
  specialInstructions?: string;
  itemModifications?: string[]; // Enhanced: List of modifications/customizations
  itemNotes?: string; // Enhanced: Additional notes for this specific item
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
  deliveryZone?: string; // Enhanced: Delivery zone for receipt
  estimatedDistance?: number; // Enhanced: Distance in km for delivery
  accessInstructions?: string; // Enhanced: Building access instructions
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
  // Enhanced: Receipt fields
  discountAmount?: number; // Amount discounted from promotional codes
  tipAmount?: number; // Customer tip amount
  serviceFee?: number; // Additional service fees
  taxBreakdown?: {
    gst: number; // 5% GST
    pst: number; // 7% PST
    hst?: number; // HST if applicable
  };
}

export interface Order {
  id: string;
  userId?: string; // User ID for access control

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
  receiptUrl?: string; // Signed URL to generated receipt PDF (24-hour expiration)
  receiptGeneratedAt?: Date; // When the receipt was generated
  receiptExpiresAt?: Date; // When the signed URL expires (24 hours after generation)
  
  // Enhanced: Receipt Information
  receiptNumber?: string; // Short, user-friendly receipt number (e.g., #1731-Q7XO)
  orderType: 'delivery' | 'pickup'; // More explicit than isDelivery boolean
  
  // Enhanced: Delivery Details
  preferredDeliveryTime?: Date; // Customer's preferred delivery time
  estimatedDeliveryTime?: Date; // Store's estimated delivery time
  deliveryTimeWindow?: { // Time window for delivery (from store schedule)
    open: string; // "09:00" format
    close: string; // "17:00" format
  };
  actualDeliveryTime?: Date; // When actually delivered
  deliveredAt?: Date; // Existing field kept for compatibility
  deliveryNotes?: string; // Driver/delivery notes
  deliveryZone?: string; // Delivery zone classification
  
  // Enhanced: Order Experience
  customerNotes?: string; // Customer's general order notes
  specialRequests?: string; // Any special requests from customer
  promotionalCodes?: string[]; // Applied promotional/discount codes
  orderSource?: 'web' | 'mobile' | 'phone' | 'admin'; // How order was placed
  
  // Enhanced: Store Information for Receipt
  storeInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string; // Store logo URL
    website?: string;
    businessNumber?: string; // Business registration number
  };
  
  // Enhanced: Timing Information
  orderPlacedAt?: Date; // When customer placed the order (may differ from createdAt)
  preparationStartedAt?: Date; // When store started preparing
  readyForPickupAt?: Date; // When order was ready
  
  // Enhanced: Payment Details for Receipt
  paymentDetails?: {
    method: 'credit_card' | 'debit_card' | 'cash' | 'digital_wallet';
    last4Digits?: string; // Last 4 digits of card
    cardBrand?: string; // Visa, Mastercard, etc.
    authorizationCode?: string; // Payment authorization code
    transactionId?: string; // Unique transaction identifier
  };
}