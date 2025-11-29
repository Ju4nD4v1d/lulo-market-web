export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
}

export interface StoreInfo {
  name: string;
  rating: number;
  reviewCount: number;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
