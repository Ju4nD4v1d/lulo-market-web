import type * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { CustomStoreDetail } from './components/CustomStoreDetail';
import { StoreData } from '../../types/store';
import { useStoreData } from '../../hooks/useStoreData';
import { trackViewContent } from '../../services/analytics';

export const StoreMenuPage: React.FC = () => {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const { stores } = useStoreData();

  // Extract store ID from URL hash (#store/storeId is primary, #shopper-dashboard/ is legacy)
  useEffect(() => {
    const hash = window.location.hash;
    const storeMatch = hash.match(/#store\/(.+)/);
    const legacyMatch = hash.match(/#shopper-dashboard\/(.+)/);
    const extractedId = storeMatch?.[1] || legacyMatch?.[1];
    if (extractedId) {
      setStoreId(extractedId);
    }
  }, []);

  // Find the store from the stores list
  useEffect(() => {
    if (storeId && stores.length > 0) {
      const store = stores.find(s => s.id === storeId);
      if (store) {
        setSelectedStore(store);
      }
    }
  }, [storeId, stores]);

  // Track ViewContent event when store loads
  const hasTrackedView = useRef(false);
  useEffect(() => {
    if (selectedStore && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackViewContent({
        contentId: selectedStore.id,
        contentName: selectedStore.name,
        contentType: 'store'
      });
    }
  }, [selectedStore]);

  const handleBack = () => {
    window.location.hash = '#';
  };

  // Loading state while fetching store
  if (!selectedStore && storeId) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '2px solid #e5e7eb',
            borderTopColor: '#C8E400',
            borderRadius: '9999px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading store...</p>
        </div>
      </div>
    );
  }

  // Store not found
  if (!selectedStore) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            Store Not Found
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            The store you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={handleBack}
            style={{
              background: '#C8E400',
              color: '#111827',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <CustomStoreDetail
      store={selectedStore}
      onBack={handleBack}
      onAddToCart={() => {
        // Cart context handles adding to cart
      }}
    />
  );
};
