import React, { useState } from 'react';
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
}

const mockMenuItems: MenuItem[] = [
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

export const StoreMenu: React.FC = () => {
  useLanguage();
  const [activeCategory, setActiveCategory] = useState('appetizers');
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const categories = [
    { id: 'appetizers', name: 'Appetizers', icon: '🥟' },
    { id: 'mains', name: 'Main Dishes', icon: '🍽️' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' }
  ];

  const store = {
    name: 'Sabor Colombiano',
    rating: 4.8,
    reviewCount: 124,
    deliveryTime: '25–35 min',
    deliveryFee: 2.99,
    minimumOrder: 15.00,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'
  };

  const filteredItems = mockMenuItems.filter(item => item.category === activeCategory);

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = mockMenuItems.find(item => item.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const handleBack = () => {
    window.location.hash = '#shopper-dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center mb-4">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg
                hover:bg-gray-100 transition-colors mr-3"
              aria-label="Go back to restaurants"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="mr-3">{store.rating} ({store.reviewCount})</span>
                <Clock className="w-4 h-4 mr-1" />
                <span className="mr-3">{store.deliveryTime}</span>
                <MapPin className="w-4 h-4 mr-1" />
                <span>1.2 km</span>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200 min-w-[44px] min-h-[44px]
                  flex items-center justify-center gap-2
                  ${activeCategory === category.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                aria-label={`View ${category.name}`}
              >
                <span>{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Store Hero */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">Delivery Fee: </span>
                ${store.deliveryFee.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Minimum: </span>
                ${store.minimumOrder.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden
                hover:shadow-md transition-all duration-300"
            >
              {/* Item Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.popular && (
                  <div className="absolute top-3 left-3 bg-primary-500 text-white text-xs
                    font-medium px-2 py-1 rounded-full">
                    Popular
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary-600">
                    ${item.price.toFixed(2)}
                  </span>
                  
                  {cart[item.id] ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-full bg-gray-200 text-gray-700
                          hover:bg-gray-300 transition-colors flex items-center justify-center"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium text-gray-900 min-w-[20px] text-center">
                        {cart[item.id]}
                      </span>
                      <button
                        onClick={() => addToCart(item.id)}
                        className="w-8 h-8 rounded-full bg-primary-500 text-white
                          hover:bg-primary-600 transition-colors flex items-center justify-center"
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item.id)}
                      disabled
                      className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium
                        cursor-not-allowed flex items-center gap-2"
                      aria-label={`Add ${item.name} to cart (coming soon)`}
                    >
                      <Plus className="w-4 h-4" />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50">
          <button
            className="w-full bg-primary-500 text-white rounded-xl py-4 px-6
              shadow-lg hover:bg-primary-600 transition-colors
              flex items-center justify-between font-medium"
            aria-label={`View cart with ${getTotalItems()} items`}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>{getTotalItems()} items</span>
            </div>
            <span>${getCartTotal().toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
};