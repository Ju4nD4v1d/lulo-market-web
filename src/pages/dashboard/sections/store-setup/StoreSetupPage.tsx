import { useState, useEffect } from 'react';
import { Store } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { useStore } from '../../../../context/StoreContext';
import { StoreForm } from './components/StoreForm';
import { SaveProgressModal } from './components/SaveProgressModal';
import { StoreProfileView } from './components/StoreProfileView';
import { useStoreByOwnerQuery } from '../../../../hooks/queries/useStoreByOwnerQuery';
import { useStoreStatsQuery } from '../../../../hooks/queries/useStoreStatsQuery';
import { useStoreMutations } from '../../../../hooks/mutations/useStoreMutations';
import { StoreData } from '../../../../types/store';
import { useAddressGeocoding } from './hooks/useAddressGeocoding';
import { isAddressComplete } from '../../../../utils/geocoding';
import styles from './StoreSetupPage.module.css';

const initialStoreData: StoreData = {
  id: '',
  name: '',
  description: '',
  category: '',
  location: {
    address: '',
    city: '',
    province: 'BC',
    postalCode: '',
    coordinates: { lat: 0, lng: 0 }
  },
  phone: '',
  email: '',
  website: '',
  socialMedia: {},
  businessHours: {},
  deliveryOptions: {
    delivery: false,
    pickup: false,
    dineIn: false
  },
  paymentMethods: [],
  cuisineType: [],
  priceRange: '$$',
  rating: 0,
  reviewCount: 0,
  images: [],
  aboutUs: [],
  aboutUsSections: [],
  verified: false,
  featured: false,
  ownerId: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const StoreSetupPage = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { hasStore, storeId, refreshStoreStatus } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [localStoreData, setLocalStoreData] = useState<StoreData>(initialStoreData);
  const [storeImage, setStoreImage] = useState<{ file?: File; preview?: string; url?: string }>({});
  const [modalStep, setModalStep] = useState<'saving' | 'uploading' | 'finalizing' | 'complete' | 'error'>('saving');
  const [showModal, setShowModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Use TanStack Query hooks
  const { storeData: queriedStoreData, storeId: queriedStoreId, isLoading: dataLoading } = useStoreByOwnerQuery({ ownerId: currentUser?.uid });
  const storeStats = useStoreStatsQuery(storeId);
  const { saveStore, isSaving, error } = useStoreMutations(currentUser?.uid || '');
  const { geocode, isGeocoding } = useAddressGeocoding();

  // Sync queried data with local state
  // Only sync when queriedStoreId changes (indicates new store data loaded)
  // This prevents infinite loops while ensuring we update when data is fetched
  useEffect(() => {
    if (queriedStoreData && queriedStoreId) {
      setLocalStoreData(queriedStoreData);
      // Set the existing store image if available
      if (queriedStoreData.images && queriedStoreData.images.length > 0) {
        setStoreImage({ url: queriedStoreData.images[0] });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queriedStoreId]); // Only depend on storeId, not the data object itself

  const handleImageUpload = (file: File) => {
    const preview = URL.createObjectURL(file);
    setStoreImage({ file, preview });
  };

  const removeStoreImage = () => {
    setStoreImage({});
  };

  const handleSave = async () => {
    try {
      // Clear previous errors and show modal
      setSaveError(null);
      setShowModal(true);
      setModalStep('saving');

      // Validate address completeness
      if (!localStoreData.location || !isAddressComplete(localStoreData.location)) {
        throw new Error(t('store.address.geocodingError'));
      }

      // Geocode address
      const geocodeResult = await geocode({
        street: localStoreData.location.address,
        city: localStoreData.location.city!,
        province: localStoreData.location.province!,
        postalCode: localStoreData.location.postalCode!,
        country: 'Canada'
      });

      if (!geocodeResult.success) {
        throw new Error(geocodeResult.error || t('store.address.geocodingError'));
      }

      // Update store data with geocoded coordinates
      const updatedStoreData = {
        ...localStoreData,
        location: {
          ...localStoreData.location,
          coordinates: geocodeResult.coordinates!,
          placeId: geocodeResult.placeId
        }
      };

      // Save to Firestore
      setModalStep('uploading');
      await saveStore(updatedStoreData, storeImage, currentUser!.uid, queriedStoreId || undefined);

      // Finalize
      setModalStep('finalizing');
      await refreshStoreStatus();

      // Complete
      setModalStep('complete');
      setTimeout(() => {
        setShowModal(false);
        setIsEditing(false);
        if (!hasStore) {
          window.location.hash = '#dashboard/products';
        }
      }, 1500);
    } catch (err) {
      console.error('Error saving store:', err);
      const errorMessage = err instanceof Error ? err.message : t('store.saveProgress.errorDesc');
      setSaveError(errorMessage);
      setModalStep('error');
    }
  };

  const handleRetry = () => {
    setShowModal(false);
    setSaveError(null);
    // User can try saving again
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSaveError(null);
  };

  // Show save progress modal
  if (showModal) {
    return (
      <SaveProgressModal
        isOpen={showModal}
        currentStep={modalStep}
        error={saveError}
        onComplete={handleCloseModal}
        onRetry={handleRetry}
        onClose={handleCloseModal}
      />
    );
  }

  // Show profile view when not editing and store exists
  if (!isEditing && hasStore && !dataLoading) {
    return (
      <StoreProfileView
        storeData={localStoreData}
        storeStats={storeStats}
        onEdit={() => setIsEditing(true)}
        t={t}
      />
    );
  }

  // Show loading state
  if (dataLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>{t('common.loading')}</p>
      </div>
    );
  }

  // Edit Mode / Initial Setup Form
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Store className={styles.icon} />
          </div>
          <h1 className={styles.title}>
            {hasStore ? t('store.edit.title') : t('store.create.title')}
          </h1>
          <p className={styles.subtitle}>
            {hasStore ? t('store.edit.subtitle') : t('store.create.subtitle')}
          </p>
        </div>

        {/* Form Container */}
        <div className={styles.formCard}>
          <StoreForm
            storeData={localStoreData}
            setStoreData={setLocalStoreData}
            storeImage={storeImage}
            handleImageUpload={handleImageUpload}
            removeStoreImage={removeStoreImage}
            onSave={handleSave}
            onCancel={hasStore ? () => setIsEditing(false) : undefined}
            saving={isSaving || isGeocoding}
            error={null}
          />
        </div>
      </div>
    </div>
  );
};

export default StoreSetupPage;
