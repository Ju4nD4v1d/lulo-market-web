import { Product } from './product';
import { SearchMetadata } from './search';

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
  deliveryHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  // Legacy field for backwards compatibility - use deliveryHours instead
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
}