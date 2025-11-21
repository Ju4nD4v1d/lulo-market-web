import React from 'react';
import { StoreData } from '../../../types/store';
import { StoreDetail } from '../../../components/StoreDetail';
import { StoreHeader } from './StoreHeader';

interface StoreDetailWrapperProps {
  store: StoreData;
  onBack: () => void;
}

export const StoreDetailWrapper: React.FC<StoreDetailWrapperProps> = ({ store, onBack }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* White Header */}
      <StoreHeader store={{
        name: store.name,
        rating: store.rating || 0,
        reviewCount: store.reviews?.length || 0,
        deliveryTime: '25-35 min', // TODO: Get from store data
        deliveryFee: 2.99, // TODO: Get from store data or config
        minimumOrder: 15.00, // TODO: Get from store data or config
        image: store.images?.[0] || ''
      }} onBack={onBack} />

      {/* Store Detail Content */}
      <StoreDetail
        store={store}
        onBack={onBack}
        onAddToCart={() => {
          // Cart context handles adding to cart
        }}
      />
    </div>
  );
};
