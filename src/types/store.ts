export interface Coordinates {
  lat: number;
  lng: number;
}

export interface StoreLocation {
  address: string;
  coordinates: Coordinates;
  placeId?: string;
}

export interface AboutUsSection {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface StoreData {
  id: string;
  name: string;
  description?: string;
  location?: StoreLocation;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
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
  aboutUs?: AboutUsSection[];
  ownerId: string;
}