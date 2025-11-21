import { MenuItem, StoreInfo, Category } from '../types';

export const mockMenuItems: MenuItem[] = [
  // Appetizers
  {
    id: '1',
    name: 'Empanadas Colombianas',
    description: 'Traditional beef and potato empanadas with aji sauce',
    price: 12.99,
    image: 'https://images.pexels.com/photos/5737241/pexels-photo-5737241.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'appetizers',
    popular: true
  },
  {
    id: '2',
    name: 'Arepas con Queso',
    description: 'Grilled corn cakes stuffed with fresh cheese',
    price: 8.99,
    image: 'https://images.pexels.com/photos/5737240/pexels-photo-5737240.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'appetizers'
  },
  {
    id: '3',
    name: 'Patacones',
    description: 'Twice-fried plantains with garlic sauce',
    price: 9.99,
    image: 'https://images.pexels.com/photos/5737242/pexels-photo-5737242.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'appetizers'
  },
  {
    id: '4',
    name: 'Chicharrón',
    description: 'Crispy pork belly with lime and salt',
    price: 14.99,
    image: 'https://images.pexels.com/photos/5737243/pexels-photo-5737243.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'appetizers'
  },

  // Mains
  {
    id: '5',
    name: 'Bandeja Paisa',
    description: 'Traditional platter with beans, rice, meat, and plantain',
    price: 24.99,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'mains',
    popular: true
  },
  {
    id: '6',
    name: 'Sancocho de Pollo',
    description: 'Hearty chicken stew with vegetables and herbs',
    price: 18.99,
    image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'mains'
  },
  {
    id: '7',
    name: 'Pescado a la Plancha',
    description: 'Grilled fish with coconut rice and salad',
    price: 22.99,
    image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'mains'
  },
  {
    id: '8',
    name: 'Pollo Asado',
    description: 'Roasted chicken with Colombian spices',
    price: 19.99,
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'mains'
  },

  // Desserts
  {
    id: '9',
    name: 'Tres Leches',
    description: 'Classic three-milk cake with cinnamon',
    price: 7.99,
    image: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'desserts',
    popular: true
  },
  {
    id: '10',
    name: 'Flan de Coco',
    description: 'Coconut flan with caramel sauce',
    price: 6.99,
    image: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'desserts'
  },
  {
    id: '11',
    name: 'Arroz con Leche',
    description: 'Traditional rice pudding with cinnamon',
    price: 5.99,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'desserts'
  },
  {
    id: '12',
    name: 'Buñuelos',
    description: 'Sweet fried dough balls with powdered sugar',
    price: 8.99,
    image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'desserts'
  }
];

export const mockStoreInfo: StoreInfo = {
  name: 'Sabor Colombiano',
  rating: 4.8,
  reviewCount: 124,
  deliveryTime: '25–35 min',
  deliveryFee: 2.99,
  minimumOrder: 15.00,
  image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'
};

export const categories: Category[] = [
  { id: 'appetizers', name: 'Appetizers', icon: '🥟' },
  { id: 'mains', name: 'Main Dishes', icon: '🍽️' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' }
];
