import { useState } from 'react';
import { Product } from '../../../../../types/product';

export const useProductFilters = (products: Product[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        // Prevent hot and frozen from being selected simultaneously
        if ((category === 'hot' && prev.includes('frozen')) ||
            (category === 'frozen' && prev.includes('hot'))) {
          return prev;
        }
        return [...prev, category];
      }
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    return matchesSearch && matchesCategory;
  });

  return {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    toggleCategory,
    filteredProducts
  };
};
