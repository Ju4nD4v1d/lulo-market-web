import type * as React from 'react';
import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CustomStoreDetail } from './components/CustomStoreDetail';
import { useStoreByIdentifierQuery } from '../../hooks/queries/useStoreQuery';
import { trackViewContent } from '../../services/analytics';

export const StoreMenuPage: React.FC = () => {
  // URL param is now called 'storeSlug' but can be either slug or legacy ID
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();

  // Fetch store by identifier (slug or ID for backward compatibility)
  const { store: selectedStore, isLoading } = useStoreByIdentifierQuery(storeSlug || null);

  // URL normalization: redirect from ID URLs to slug URLs for SEO
  useEffect(() => {
    if (selectedStore && storeSlug && storeSlug !== selectedStore.slug) {
      // User accessed via ID or old URL, redirect to canonical slug URL
      navigate(`/store/${selectedStore.slug}`, { replace: true });
    }
  }, [selectedStore, storeSlug, navigate]);

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
    navigate('/');
  };

  // Loading state while fetching store
  if (isLoading) {
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
