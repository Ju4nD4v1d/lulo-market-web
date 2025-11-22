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
    country: 'Canada',
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
  const [saveStep, setSaveStep] = useState(1);

  // Use TanStack Query hooks
  const { storeData: queriedStoreData, storeId: queriedStoreId, isLoading: dataLoading } = useStoreByOwnerQuery({ ownerId: currentUser?.uid });
  const storeStats = useStoreStatsQuery(storeId);
  const { saveStore, isSaving, error } = useStoreMutations(currentUser?.uid || '');

  // Sync queried data with local state
  // Only sync when queriedStoreId changes (indicates new store data loaded)
  // This prevents infinite loops while ensuring we update when data is fetched
  useEffect(() => {
    if (queriedStoreData && queriedStoreId) {
      setLocalStoreData(queriedStoreData);
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

  const updateAboutSection = (index: number, field: string, value: any) => {
    setLocalStoreData(prev => ({
      ...prev,
      aboutUs: prev.aboutUs.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const handleSave = async () => {
    try {
      setSaveStep(1);
      await saveStore(localStoreData, storeImage, currentUser!.uid, queriedStoreId || undefined);
      setSaveStep(3);
      await refreshStoreStatus();
      setTimeout(() => {
        setIsEditing(false);
        if (!hasStore) {
          window.location.hash = '#dashboard/products';
        }
      }, 1500);
    } catch (err) {
      console.error('Error saving store:', err);
    }
  };

  // Show save progress modal
  if (isSaving) {
    return (
      <SaveProgressModal
        isOpen={isSaving}
        currentStep={saveStep}
        onComplete={() => {}}
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
            updateAboutSection={updateAboutSection}
            onSave={handleSave}
            onCancel={hasStore ? () => setIsEditing(false) : undefined}
            saving={isSaving}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default StoreSetupPage;
