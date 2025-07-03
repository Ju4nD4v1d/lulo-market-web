export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  storeId?: string;           // Store review
  productId?: string;         // Product review  
  rating: number;             // 1-5 stars
  comment: string;
  images?: string[];          // User photos
  helpful: number;            // Helpful votes
  timestamp: Date;
  verified: boolean;          // Verified purchase
  orderId?: string;           // Reference to purchase order
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}