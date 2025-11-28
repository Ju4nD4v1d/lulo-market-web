export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  imageUrl?: string;                 // Primary product image URL
  status: 'active' | 'draft' | 'outOfStock';
  available?: boolean;               // Product availability status
  ownerId: string;
  storeId: string;
  pstPercentage?: number;
  gstPercentage?: number;
  // Enhanced shopper experience fields
  averageRating?: number;        // Product-specific rating (0-5)
  reviewCount?: number;          // Number of product reviews
  isPopular?: boolean;           // Trending/popular indicator
  preparationTime?: string;      // "15-20 min"
  servingSize?: string;          // "Serves 2-3"
  allergens?: string[];          // ["nuts", "dairy", "gluten"]
  ingredients?: {                // Ingredients list with allergen warnings
    main: string[];              // ["Organic flour", "Water", "Salt"]
    contains?: string[];         // ["Wheat", "Gluten"] - allergen labeling
  };
  nutritionInfo?: {              // Optional nutrition data
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}