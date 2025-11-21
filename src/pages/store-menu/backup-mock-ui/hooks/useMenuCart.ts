import { useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
}

interface UseMenuCartReturn {
  cart: { [key: string]: number };
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  getCartTotal: (items: MenuItem[]) => number;
  getTotalItems: () => number;
}

/**
 * Custom hook to manage menu item cart state
 */
export const useMenuCart = (): UseMenuCartReturn => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});

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

  const getCartTotal = (items: MenuItem[]) => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = items.find(item => item.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    getCartTotal,
    getTotalItems,
  };
};
