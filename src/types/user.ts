import { StoreLocation } from './store';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  phoneNumber?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    dietaryRestrictions?: string[];     // ["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"]
    favoriteStores?: string[];          // Array of store IDs
    defaultLocation?: StoreLocation;    // User's default delivery address
    notifications?: {
      orderUpdates: boolean;
      promotions: boolean;
      newStores: boolean;
      reviews: boolean;
    };
  };
  orderHistory?: string[];              // Array of order IDs
  totalOrders?: number;                 // Total number of orders placed
  memberSince?: Date;                   // Registration date
  loyaltyPoints?: number;               // Points for loyalty program
}

export interface UserAddress {
  id: string;
  userId: string;
  label: string;                        // "Home", "Work", "Other"
  location: StoreLocation;
  isDefault: boolean;
  deliveryInstructions?: string;
}

export type DietaryRestriction = 
  | 'vegetarian' 
  | 'vegan' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'nut-free' 
  | 'halal' 
  | 'kosher';