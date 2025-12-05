import { Product } from './product';
import { SearchMetadata } from './search';
import { MultiSlotSchedule } from './schedule';

export interface AboutUsSection {
  id: string;
  title: string;
  description: string;
  image?: File;
  imagePreview?: string;
  imageUrl?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface StoreLocation {
  address: string;
  city?: string;
  province?: string;
  postalCode?: string;
  coordinates: Coordinates;
  placeId?: string;
}

export interface StoreData {
  id: string;
  name: string;
  description?: string;
  category?: string;
  country?: string;
  cuisine?: string;
  location?: StoreLocation;
  address?: string;  // Legacy field for backward compatibility with StoreSetup
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  // Multi-slot delivery schedule (NEW - supports up to 3 time slots per day)
  deliverySchedule?: MultiSlotSchedule;
  // Legacy single-slot format - use deliverySchedule for new stores
  deliveryHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  // Legacy field for backwards compatibility - use deliverySchedule instead
  businessHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  deliveryOptions?: {
    pickup: boolean;
    delivery: boolean;
    shipping: boolean;
  };
  paymentMethods?: {
    cash: boolean;
    card: boolean;
    transfer: boolean;
  };
  deliveryCostWithDiscount?: number;
  minimumOrder?: number;
  imageUrl?: string;
  storeImage?: string;
  aboutUsSections?: AboutUsSection[];
  aboutUs?: AboutUsSection[];  // Alternative field name for backward compatibility
  // Firestore About Us fields
  titleTabAboutFirst?: string;
  bodyTabAboutFirst?: string;
  imageTabAboutFirst?: string;
  titleTabAboutSecond?: string;
  bodyTabAboutSecond?: string;
  imageTabAboutSecond?: string;
  titleTabAboutThird?: string;
  bodyTabAboutThird?: string;
  imageTabAboutThird?: string;
  ownerId: string;
  // Enhanced shopper experience fields
  averageRating?: number;        // Calculated average rating (0-5)
  totalReviews?: number;         // Total number of reviews
  isVerified?: boolean;          // Verified business status
  status?: 'active' | 'inactive' | 'pending';  // Store operational status
  createdAt?: Date;              // Store creation timestamp
  updatedAt?: Date;              // Store last update timestamp
  // Products field for mock data and test mode
  products?: Product[];          // Products available in this store
  // Search metadata (added when store comes from search results)
  searchMetadata?: SearchMetadata;
  // Stripe Connect fields
  stripeAccountId?: string;      // Connected Stripe account ID
  stripeEnabled?: boolean;       // Whether charges/payments are enabled
  stripePayoutsEnabled?: boolean; // Whether payouts are enabled
  stripeDetailsSubmitted?: boolean; // Whether onboarding forms completed
  stripeOnboardingComplete?: boolean;  // Legacy - use stripeDetailsSubmitted
  stripeAccountStatus?: StripeAccountStatus; // Current account status
  stripeUpdatedAt?: Date;        // Last status update timestamp
  // Inventory settings
  lowStockThreshold?: number;    // Products below this quantity show warnings (default: 10)
  // Founder program
  isFounderStore?: boolean;      // Flag for early adopter stores - shown with special badge
  // Marketplace readiness (set by backend when Stripe + legal agreements are complete)
  isMarketplaceReady?: boolean;
}

// Stripe Connect account status
export type StripeAccountStatus =
  | 'pending_onboarding'    // Started but didn't finish forms
  | 'pending_verification'  // Completed forms, Stripe reviewing
  | 'restricted'            // Missing info or failed verification
  | 'enabled'               // Fully active, can accept payments
  | 'disabled';             // Account deauthorized/disconnected