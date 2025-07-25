import { StoreData } from '../types/store';
import { generateOrderId } from './orderUtils';

// Mock user data
export const mockUser = {
  uid: 'mock-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true
};

// Mock user profile
export const mockUserProfile = {
  uid: 'mock-user-123',
  displayName: 'Test User',
  email: 'test@example.com',
  phoneNumber: '+1 (555) 123-4567',
  avatar: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
};

// Product categories and items
const productCategories = [
  'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Side Dishes', 'Soups', 'Salads'
];

const productNames = {
  colombian: [
    'Arepa con Queso', 'Bandeja Paisa', 'Sancocho', 'Empanadas', 'Ajiaco', 'Tamales',
    'Patacones', 'Chicharrón', 'Mazorca Desgranada', 'Buñuelos', 'Natilla', 'Tres Leches',
    'Aguapanela', 'Café Colombiano', 'Jugo de Lulo', 'Chorizo Santarrosano', 'Lechona',
    'Arroz con Pollo', 'Mondongo', 'Frijoles Rojos'
  ],
  brazilian: [
    'Feijoada', 'Pão de Açúcar', 'Coxinha', 'Brigadeiro', 'Açaí Bowl', 'Pastéis',
    'Moqueca', 'Churrasco', 'Caipirinha', 'Guaraná', 'Beijinho', 'Quindim',
    'Tapioca', 'Picanha', 'Farofa', 'Pão de Queijo', 'Bobo de Camarão',
    'Vatapá', 'Acarajé', 'Cocada'
  ],
  venezuelan: [
    'Arepa Reina Pepiada', 'Cachapa', 'Pabellón Criollo', 'Hallaca', 'Tequeños',
    'Asado Negro', 'Quesillo', 'Tres Leches', 'Chicha', 'Malta Polar',
    'Empanada de Queso', 'Tajadas', 'Caraotas Negras', 'Yuca Frita',
    'Pollo Guisado', 'Pescado a la Plancha', 'Ensalada de Gallina', 'Mandoca',
    'Golfeados', 'Bienmesabe'
  ],
  mexican: [
    'Tacos al Pastor', 'Enchiladas', 'Guacamole', 'Quesadillas', 'Pozole', 'Tamales',
    'Chiles Rellenos', 'Mole Poblano', 'Ceviche', 'Horchata', 'Churros', 'Flan',
    'Margarita', 'Agua Fresca', 'Elote', 'Sopes', 'Tostadas', 'Cochinita Pibil',
    'Birria', 'Tres Leches Cake'
  ]
};

const storeNames = {
  colombian: [
    'Sabor Colombiano', 'Casa Bogotá', 'El Rincón Paisa', 'La Fonda Antioqueña',
    'Café Medellín', 'Restaurante Cartagena', 'El Buen Gusto'
  ],
  brazilian: [
    'Brasil Gourmet', 'Sabor Carioca', 'Rio de Sabores', 'Churrascaria Gaucha',
    'Açaí Tropical', 'Boteco Brasileiro', 'Casa do Norte'
  ],
  venezuelan: [
    'Sabor Venezolano', 'La Arepa Dorada', 'Casa Caracas', 'El Pabellón',
    'Maracaibo Grill', 'La Cachapa Feliz', 'Rincón Criollo'
  ],
  mexican: [
    'Casa Mexico', 'Tacos & Más', 'El Azteca', 'La Cantina',
    'Sabores de Jalisco', 'México Lindo', 'El Comal Dorado'
  ]
};

const generateRandomId = () => Math.random().toString(36).substr(2, 9);

const getRandomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const getRandomPrice = (min: number = 8, max: number = 35) => 
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const getRandomRating = () => Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 to 5.0

const getRandomReviewCount = () => Math.floor(Math.random() * 200) + 10;

// Generate mock products for a country
const generateProducts = (country: keyof typeof productNames, storeId: string, count: number = 15) => {
  const products = [];
  const names = productNames[country];
  const usedNames = new Set();

  for (let i = 0; i < count && usedNames.size < names.length; i++) {
    let name;
    do {
      name = getRandomElement(names);
    } while (usedNames.has(name));
    usedNames.add(name);

    products.push({
      id: generateRandomId(),
      name,
      description: `Authentic ${country} ${name.toLowerCase()} made with traditional ingredients and love.`,
      price: getRandomPrice(),
      images: [`https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=400&h=300&fit=crop&crop=center`],
      category: getRandomElement(productCategories),
      stock: Math.floor(Math.random() * 50) + 5, // 5-55 stock
      status: 'active',
      available: Math.random() > 0.1, // 90% available
      ownerId: `mock-owner-${country}`,
      storeId: storeId,
      averageRating: getRandomRating(),
      reviewCount: getRandomReviewCount(),
      isPopular: Math.random() > 0.7, // 30% popular
      preparationTime: `${Math.floor(Math.random() * 30) + 10}-${Math.floor(Math.random() * 30) + 15} min`,
      servingSize: `Serves ${Math.floor(Math.random() * 3) + 1}`,
      allergens: Math.random() > 0.8 ? ['gluten'] : [],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in last year
      updatedAt: new Date()
    });
  }

  return products;
};

// Generate mock stores for a country
export const generateMockStores = (country: keyof typeof productNames): StoreData[] => {
  const stores: StoreData[] = [];
  const names = storeNames[country];

  names.forEach((name, index) => {
    const createdDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const hasRating = Math.random() > 0.3;
    const rating = hasRating ? getRandomRating() : undefined;
    const reviewCount = hasRating ? getRandomReviewCount() : 0;

    const storeId = `${country}-store-${index + 1}`;
    
    stores.push({
      id: storeId,
      name,
      description: `Authentic ${country} store serving traditional products with a modern twist. Family-owned and operated with recipes passed down through generations.`,
      storeImage: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=600&h=400&fit=crop&crop=center`,
      imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=600&h=400&fit=crop&crop=center`,
      averageRating: rating,
      totalReviews: reviewCount,
      location: {
        address: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(['Main', 'Oak', 'Pine', 'Cedar', 'Maple'])} ${getRandomElement(['St', 'Ave', 'Blvd', 'Dr'])}, Vancouver, BC`,
        coordinates: {
          lat: 49.2827 + (Math.random() - 0.5) * 0.1, // Vancouver area
          lng: -123.1207 + (Math.random() - 0.5) * 0.1
        },
        placeId: `mock-place-${generateRandomId()}`
      },
      deliveryOptions: {
        delivery: true,
        pickup: Math.random() > 0.3,
        shipping: false
      },
      deliveryCostWithDiscount: Math.random() > 0.2 ? getRandomPrice(2.99, 7.99) : 0,
      minimumOrder: Math.floor(Math.random() * 20) + 15, // $15-35
      businessHours: {
        monday: { open: '11:00', close: '22:00', isOpen: true },
        tuesday: { open: '11:00', close: '22:00', isOpen: true },
        wednesday: { open: '11:00', close: '22:00', isOpen: true },
        thursday: { open: '11:00', close: '22:00', isOpen: true },
        friday: { open: '11:00', close: '23:00', isOpen: true },
        saturday: { open: '10:00', close: '23:00', isOpen: true },
        sunday: { open: '12:00', close: '21:00', isOpen: Math.random() > 0.3 }
      },
      socialMedia: {
        instagram: Math.random() > 0.5 ? `@${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
        facebook: Math.random() > 0.5 ? name : undefined
      },
      aboutUsSections: [
        {
          id: generateRandomId(),
          title: 'Our Story',
          content: `Welcome to ${name}! We are a family-owned store dedicated to bringing you the authentic flavors of ${country}. Our recipes have been passed down through generations, ensuring every dish is prepared with love and tradition.`,
          imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=600&h=400&fit=crop&crop=center`,
          order: 0
        }
      ],
      ownerId: `mock-owner-${country}-${index + 1}`,
      isVerified: Math.random() > 0.4,
      createdAt: createdDate,
      updatedAt: new Date(),
      // Add mock products with correct storeId
      products: generateProducts(country, storeId, Math.floor(Math.random() * 16) + 5) // 5-20 products
    });
  });

  return stores;
};

// Generate all mock stores
export const generateAllMockStores = (): StoreData[] => {
  const allStores: StoreData[] = [];
  
  (Object.keys(storeNames) as Array<keyof typeof productNames>).forEach(country => {
    allStores.push(...generateMockStores(country));
  });

  return allStores;
};

// Mock orders
export const generateMockOrders = (count: number = 10) => {
  const orders = [];
  const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
  
  for (let i = 0; i < count; i++) {
    const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const orderId = generateOrderId(); // Use consistent order ID generation
    orders.push({
      id: orderId,
      userId: mockUser.uid,
      storeId: `colombian-store-${Math.floor(Math.random() * 7) + 1}`,
      items: [
        {
          productId: generateRandomId(),
          name: getRandomElement(productNames.colombian),
          price: getRandomPrice(),
          quantity: Math.floor(Math.random() * 3) + 1,
          imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=400&h=300&fit=crop&crop=center`
        }
      ],
      status: getRandomElement(statuses),
      total: getRandomPrice(15, 65),
      subtotal: getRandomPrice(12, 55),
      tax: getRandomPrice(1, 8),
      deliveryFee: getRandomPrice(2.99, 6.99),
      customerInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1 (555) 123-4567'
      },
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6B 1A1',
        apartmentNumber: '401',
        deliveryInstructions: 'Ring buzzer'
      },
      orderType: Math.random() > 0.5 ? 'delivery' : 'pickup',
      estimatedTime: Math.floor(Math.random() * 40) + 20,
      createdAt: createdDate,
      updatedAt: new Date()
    });
  }
  
  return orders;
};

// Mock reviews
export const generateMockReviews = (storeId: string, count: number = 15) => {
  const reviews = [];
  const reviewTexts = [
    'Amazing food and great service!',
    'Authentic flavors that remind me of home.',
    'Fresh ingredients and fast delivery.',
    'The best Latino food in the city!',
    'Family recipes done right.',
    'Always consistent quality.',
    'Love the traditional preparation.',
    'Perfect for weekend family dinners.'
  ];

  for (let i = 0; i < count; i++) {
    reviews.push({
      id: generateRandomId(),
      userId: `mock-user-${generateRandomId()}`,
      storeId,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars mostly
      comment: getRandomElement(reviewTexts),
      userName: `Customer ${i + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    });
  }

  return reviews;
};