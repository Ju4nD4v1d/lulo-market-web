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
import { useAllLatestAgreementsQuery } from '../../../../hooks/queries';
import { useStoreMutations } from '../../../../hooks/mutations/useStoreMutations';
import { useDashboardNavigation } from '../../../../hooks/useDashboardNavigation';
import { StoreData } from '../../../../types/store';
import { DEFAULT_MULTI_SLOT_SCHEDULE } from '../../../../types/schedule';
import { useAddressGeocoding } from './hooks/useAddressGeocoding';
import { isAddressComplete } from '../../../../utils/geocoding';
import { saveStoreAcceptances, getStoreAcceptances } from '../../../../services/api';
import type { AgreementState } from './components/LegalAgreements';
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
  deliveryHours: {
    Monday: { open: '09:00', close: '17:00', closed: false },
    Tuesday: { open: '09:00', close: '17:00', closed: false },
    Wednesday: { open: '09:00', close: '17:00', closed: false },
    Thursday: { open: '09:00', close: '17:00', closed: false },
    Friday: { open: '09:00', close: '17:00', closed: false },
    Saturday: { open: '09:00', close: '17:00', closed: false },
    Sunday: { open: '09:00', close: '17:00', closed: true }
  },
  // Multi-slot delivery schedule (NEW)
  deliverySchedule: DEFAULT_MULTI_SLOT_SCHEDULE,
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
  updatedAt: new Date(),
  lowStockThreshold: 10
};

export const StoreSetupPage = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { hasStore, storeId, refreshStoreStatus } = useStore();
  const { goToProducts } = useDashboardNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [localStoreData, setLocalStoreData] = useState<StoreData>(initialStoreData);
  const [storeImage, setStoreImage] = useState<{ file?: File; preview?: string; url?: string }>({});
  const [modalStep, setModalStep] = useState<'saving' | 'uploading' | 'finalizing' | 'complete' | 'error'>('saving');
  const [showModal, setShowModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [agreementsAlreadyAccepted, setAgreementsAlreadyAccepted] = useState(false);
  const [existingAcceptances, setExistingAcceptances] = useState<AgreementState>({
    sellerAgreement: false,
    payoutPolicy: false,
    refundPolicy: false,
  });
  const [acceptancesLoading, setAcceptancesLoading] = useState(true);

  // Use TanStack Query hooks
  const { storeData: queriedStoreData, storeId: queriedStoreId, isLoading: dataLoading } = useStoreByOwnerQuery({ ownerId: currentUser?.uid });
  const storeStats = useStoreStatsQuery(storeId);
  const { saveStore, isSaving, error } = useStoreMutations(currentUser?.uid || '');
  const { geocode, isGeocoding } = useAddressGeocoding();

  // Fetch latest agreement versions for saving with acceptances
  const { data: latestAgreements, isLoading: agreementsDataLoading } = useAllLatestAgreementsQuery(!agreementsAlreadyAccepted);

  // Fetch existing acceptances to determine if agreements should be shown
  useEffect(() => {
    let isCancelled = false;

    const fetchAcceptances = async () => {
      // Only check for existing stores
      if (!storeId) {
        setAcceptancesLoading(false);
        setAgreementsAlreadyAccepted(false);
        setExistingAcceptances({
          sellerAgreement: false,
          payoutPolicy: false,
          refundPolicy: false,
        });
        return;
      }

      try {
        const acceptances = await getStoreAcceptances(storeId);
        if (!isCancelled) {
          // Track individual acceptance states
          const sellerAccepted = acceptances?.sellerAgreement?.accepted ?? false;
          const payoutAccepted = acceptances?.payoutPolicy?.accepted ?? false;
          const refundAccepted = acceptances?.refundPolicy?.accepted ?? false;

          setExistingAcceptances({
            sellerAgreement: sellerAccepted,
            payoutPolicy: payoutAccepted,
            refundPolicy: refundAccepted,
          });

          // Check if ALL three agreements have been accepted
          const allAccepted = sellerAccepted && payoutAccepted && refundAccepted;
          setAgreementsAlreadyAccepted(allAccepted);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching acceptances:', err);
          // If error, assume not accepted to be safe
          setAgreementsAlreadyAccepted(false);
          setExistingAcceptances({
            sellerAgreement: false,
            payoutPolicy: false,
            refundPolicy: false,
          });
        }
      } finally {
        if (!isCancelled) {
          setAcceptancesLoading(false);
        }
      }
    };

    fetchAcceptances();

    return () => {
      isCancelled = true;
    };
  }, [storeId]);

  // Sync queried data with local state
  // Sync when data is loaded or updated (e.g., after saving)
  useEffect(() => {
    if (queriedStoreData && queriedStoreId) {
      setLocalStoreData(queriedStoreData);
      // Set the existing store image if available (use storeImage field first, then images array)
      if (queriedStoreData.storeImage) {
        setStoreImage({ url: queriedStoreData.storeImage });
      } else if (queriedStoreData.images && queriedStoreData.images.length > 0) {
        setStoreImage({ url: queriedStoreData.images[0] });
      } else {
        setStoreImage({});
      }
    }
  }, [queriedStoreId, queriedStoreData]); // Sync all store data when query returns

  // Reset modal state when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      setShowModal(false);
      setModalStep('saving');
      setSaveError(null);
    };
  }, []);

  const handleImageUpload = (file: File) => {
    const preview = URL.createObjectURL(file);
    setStoreImage({ file, preview });
  };

  const removeStoreImage = () => {
    setStoreImage({});
  };

  const handleSave = async (agreements: AgreementState) => {
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
      const savedStore = await saveStore(updatedStoreData, storeImage, currentUser!.uid, queriedStoreId || undefined);

      // Validate that we have a store ID
      const storeIdToUse = savedStore?.id || queriedStoreId;
      if (!storeIdToUse) {
        throw new Error('Failed to retrieve store ID after save');
      }

      // Save legal agreements acceptances ONLY when not already accepted
      // This handles both new stores AND existing stores that haven't accepted yet
      // Once accepted, agreements cannot be modified - they're visible in Documents section
      if (!agreementsAlreadyAccepted && currentUser?.uid) {
        try {
          await saveStoreAcceptances({
            storeId: storeIdToUse,
            ownerId: currentUser.uid,
            sellerAgreement: {
              accepted: agreements.sellerAgreement,
              versionId: latestAgreements?.sellerAgreement?.id || null,
              version: latestAgreements?.sellerAgreement?.version || null,
            },
            payoutPolicy: {
              accepted: agreements.payoutPolicy,
              versionId: latestAgreements?.payoutPolicy?.id || null,
              version: latestAgreements?.payoutPolicy?.version || null,
            },
            refundPolicy: {
              accepted: agreements.refundPolicy,
              versionId: latestAgreements?.refundPolicy?.id || null,
              version: latestAgreements?.refundPolicy?.version || null,
            },
          });
        } catch (acceptanceError) {
          // Log but don't fail the whole operation - store was saved successfully
          // User can re-save to retry acceptances
          console.error('Error saving acceptances (store was saved):', acceptanceError);
        }
      }

      // Finalize
      setModalStep('finalizing');
      await refreshStoreStatus();

      // Complete
      setModalStep('complete');
      setTimeout(() => {
        setShowModal(false);
        setIsEditing(false);
        if (!hasStore) {
          goToProducts();
        }
      }, 1500);
    } catch (err) {
      console.error('Error saving store:', err);

      // Map Firebase and other errors to user-friendly messages
      let errorMessage = t('store.saveProgress.errorDesc');

      if (err instanceof Error) {
        const errorCode = (err as any).code;

        // Map Firebase error codes
        if (errorCode) {
          switch (errorCode) {
            case 'permission-denied':
              errorMessage = t('store.errors.permissionDenied');
              break;
            case 'unavailable':
              errorMessage = t('store.errors.networkError');
              break;
            case 'invalid-argument':
              errorMessage = t('store.errors.invalidData');
              break;
            case 'unauthenticated':
              errorMessage = t('store.errors.notAuthenticated');
              break;
            default:
              // If error message is user-friendly (from validation), use it
              if (!err.message.includes('FirebaseError') && !err.message.includes('Function')) {
                errorMessage = err.message;
              }
          }
        } else {
          // Use the error message if it's not a technical Firebase error
          if (!err.message.includes('FirebaseError') && !err.message.includes('Function')) {
            errorMessage = err.message;
          }
        }
      }

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

  // Show loading state (including while checking agreement status and loading agreement versions)
  if (dataLoading || acceptancesLoading || agreementsDataLoading) {
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
            isEditMode={hasStore}
            agreementsAlreadyAccepted={agreementsAlreadyAccepted}
            existingAcceptances={existingAcceptances}
          />
        </div>
      </div>
    </div>
  );
};

export default StoreSetupPage;
