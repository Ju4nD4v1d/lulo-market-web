import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Simple test wrapper for basic rendering
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="test-wrapper">{children}</div>;
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock user data
export const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  phoneNumber: '+1234567890',
};

// Mock store data
export const mockStore = {
  id: 'store-123',
  name: 'Test Restaurant',
  description: 'A test restaurant for unit tests',
  imageUrl: 'https://example.com/image.jpg',
  averageRating: 4.5,
  totalReviews: 25,
  location: {
    address: '123 Test St, Vancouver, BC',
    coordinates: { lat: 49.2827, lng: -123.1207 },
  },
  deliveryOptions: { delivery: true, pickup: true, shipping: false },
  deliveryCostWithDiscount: 4.99,
  minimumOrder: 25,
  aboutUsSections: [],
  ownerId: 'owner-123',
  isVerified: true,
  createdAt: new Date('2024-01-15'),
};

// Mock product data
export const mockProduct = {
  id: 'product-123',
  name: 'Test Product',
  description: 'A test product for unit tests',
  price: 15.99,
  category: 'Main Course',
  imageUrl: 'https://example.com/product.jpg',
  status: 'active' as const,
  storeId: 'store-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock cart item
export const mockCartItem = {
  id: 'cart-item-123',
  product: mockProduct,
  quantity: 2,
  priceAtTime: 15.99,
};

// Mock order data
export const mockOrder = {
  id: 'order-123',
  userId: 'test-user-123',
  storeId: 'store-123',
  storeName: 'Test Restaurant',
  status: 'pending' as const,
  items: [mockCartItem],
  summary: {
    subtotal: 31.98,
    tax: 3.84,
    deliveryFee: 4.99,
    total: 40.81,
    itemCount: 2,
  },
  customerInfo: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
  },
  deliveryAddress: {
    street: '123 Test St',
    city: 'Vancouver',
    province: 'BC',
    postalCode: 'V6B 1A1',
    deliveryInstructions: 'Ring doorbell',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};