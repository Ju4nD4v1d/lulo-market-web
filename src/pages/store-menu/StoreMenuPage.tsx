import type * as React from 'react';
import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CustomStoreDetail } from './components/CustomStoreDetail';
import { useStoreByIdentifierQuery } from '../../hooks/queries/useStoreQuery';
import { trackViewContent } from '../../services/analytics';
import { VibrantBackground } from '../../components/VibrantBackground/VibrantBackground';

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
      <VibrantBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-[#C8E400] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Loading store...</p>
          </div>
        </div>
      </VibrantBackground>
    );
  }

  // Store not found
  if (!selectedStore) {
    return (
      <VibrantBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl max-w-md mx-4">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Store Not Found
            </h2>
            <p className="text-white/70 mb-6">
              The store you're looking for doesn't exist or couldn't be loaded.
            </p>
            <button
              onClick={handleBack}
              className="bg-[#C8E400] hover:bg-[#e7ff01] text-gray-900 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </VibrantBackground>
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
