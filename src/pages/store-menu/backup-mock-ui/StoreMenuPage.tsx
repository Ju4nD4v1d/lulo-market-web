import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMenuCart } from './hooks';
import {
  StoreHeader,
  CategoryTabs,
  StoreHero,
  MenuItem,
  FloatingCartButton,
} from './components';
import { mockMenuItems, mockStoreInfo, categories } from './data/mockData';
import styles from './StoreMenuPage.module.css';

export const StoreMenuPage: React.FC = () => {
  useLanguage();
  const [activeCategory, setActiveCategory] = useState('appetizers');
  const { cart, addToCart, removeFromCart, getCartTotal, getTotalItems } = useMenuCart();

  const filteredItems = useMemo(
    () => mockMenuItems.filter(item => item.category === activeCategory),
    [activeCategory]
  );

  const handleBack = () => {
    window.location.hash = '#';
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <StoreHeader store={mockStoreInfo} onBack={handleBack} />

      {/* Category Tabs */}
      <div className={styles.categorySection}>
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Store Hero */}
      <StoreHero store={mockStoreInfo} />

      {/* Menu Items */}
      <div className={styles.container}>
        <div className={styles.grid}>
          {filteredItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              quantity={cart[item.id] || 0}
              onAdd={() => addToCart(item.id)}
              onRemove={() => removeFromCart(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton
        itemCount={getTotalItems()}
        total={getCartTotal(mockMenuItems)}
      />
    </div>
  );
};
