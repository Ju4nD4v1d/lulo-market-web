/**
 * StoreForm Component (Refactored)
 *
 * Orchestrates the multi-stage store setup process
 * Uses the new scalable architecture with individual stage components
 */

import type * as React from 'react';
import { useState } from 'react';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import { StoreData } from '../../../../../types/store';
import { StageProgressBar } from './StageProgressBar';
import { StageContainer } from './StageContainer';
import { getStageById, TOTAL_STAGES } from '../config/stageConfig';
import {
  BasicInfoStage,
  AddressStage,
  ContactInfoStage,
  ServiceAgreementStage,
  PricingConfirmationStage,
} from './stages';

interface StoreFormProps {
  storeData: StoreData;
  setStoreData: (data: StoreData) => void;
  storeImage: {
    file?: File;
    preview?: string;
    url?: string;
  };
  handleImageUpload: (file: File) => void;
  removeStoreImage?: () => void;
  onSave: () => void;
  onCancel?: () => void;
  saving: boolean;
  error: string | null;
}

export const StoreForm: React.FC<StoreFormProps> = ({
  storeData,
  setStoreData,
  storeImage,
  handleImageUpload,
  removeStoreImage,
  onSave,
  onCancel,
  saving,
  error
}) => {
  const { t } = useLanguage();
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [pricingConfirmed, setPricingConfirmed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateStage = (stage: number): string | null => {
    switch (stage) {
      case 1:
        if (!storeData.name?.trim()) return t('store.validation.nameRequired');
        if (!storeData.category?.trim()) return t('store.validation.categoryRequired');
        if (!storeData.cuisine?.trim()) return t('store.validation.cuisineRequired');
        if (!storeData.description?.trim()) return t('store.validation.descriptionRequired');
        if (!storeImage.preview && !storeImage.url) return t('store.validation.imageRequired');
        return null;
      case 2:
        if (!storeData.location?.address?.trim()) return t('store.validation.streetRequired');
        if (!storeData.location?.city?.trim()) return t('store.validation.cityRequired');
        if (!storeData.location?.province?.trim()) return t('store.validation.provinceRequired');
        if (!storeData.location?.postalCode?.trim()) return t('store.validation.postalCodeRequired');
        return null;
      case 3:
        if (!storeData.phone?.trim()) return t('store.validation.phoneRequired');
        if (!storeData.email?.trim()) return t('store.validation.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeData.email)) {
          return t('store.validation.emailInvalid');
        }
        // Validate at least one delivery hour is set
        const hasDeliveryHours = Object.values(storeData.deliveryHours || {}).some(day => !day.closed);
        if (!hasDeliveryHours) return t('store.validation.deliveryHoursRequired');
        return null;
      case 4:
        if (!agreementAccepted) return t('store.validation.agreementRequired');
        return null;
      case 5:
        if (!pricingConfirmed) return t('store.validation.pricingRequired');
        return null;
      default:
        return null;
    }
  };

  const nextStage = () => {
    setValidationError(null);

    const error = validateStage(currentStage);
    if (error) {
      setValidationError(error);
      return;
    }

    setCompletedStages(prev => new Set(prev).add(currentStage));
    setCurrentStage(currentStage + 1);
  };

  const prevStage = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
      setValidationError(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-orange-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Progress Bar */}
        <StageProgressBar
          currentStage={currentStage}
          completedStages={completedStages}
        />

        {/* Stage 1: Basic Information */}
        {currentStage === 1 && (
          <div className="animate-[slideInRight_0.5s_ease-out]">
            <StageContainer stage={getStageById(1)!}>
              <BasicInfoStage
                name={storeData.name}
                category={storeData.category || ''}
                cuisine={storeData.cuisine || ''}
                description={storeData.description}
                storeImage={storeImage}
                onNameChange={(value) => setStoreData({ ...storeData, name: value })}
                onCategoryChange={(value) => setStoreData({ ...storeData, category: value })}
                onCuisineChange={(value) => setStoreData({ ...storeData, cuisine: value })}
                onDescriptionChange={(value) => setStoreData({ ...storeData, description: value })}
                onImageUpload={handleImageUpload}
                onImageRemove={() => removeStoreImage?.()}
              />
            </StageContainer>
          </div>
        )}

        {/* Stage 2: Address */}
        {currentStage === 2 && (
          <div className="animate-[slideInRight_0.5s_ease-out]">
            <StageContainer stage={getStageById(2)!}>
              <AddressStage
                street={storeData.location?.address || ''}
                city={storeData.location?.city || ''}
                province={storeData.location?.province || 'BC'}
                postalCode={storeData.location?.postalCode || ''}
                onStreetChange={(value) => setStoreData({
                  ...storeData,
                  location: {
                    address: value,
                    city: storeData.location?.city || '',
                    province: storeData.location?.province || 'BC',
                    postalCode: storeData.location?.postalCode || '',
                    coordinates: storeData.location?.coordinates || { lat: 0, lng: 0 }
                  }
                })}
                onCityChange={(value) => setStoreData({
                  ...storeData,
                  location: {
                    address: storeData.location?.address || '',
                    city: value,
                    province: storeData.location?.province || 'BC',
                    postalCode: storeData.location?.postalCode || '',
                    coordinates: storeData.location?.coordinates || { lat: 0, lng: 0 }
                  }
                })}
                onProvinceChange={(value) => setStoreData({
                  ...storeData,
                  location: {
                    address: storeData.location?.address || '',
                    city: storeData.location?.city || '',
                    province: value,
                    postalCode: storeData.location?.postalCode || '',
                    coordinates: storeData.location?.coordinates || { lat: 0, lng: 0 }
                  }
                })}
                onPostalCodeChange={(value) => setStoreData({
                  ...storeData,
                  location: {
                    address: storeData.location?.address || '',
                    city: storeData.location?.city || '',
                    province: storeData.location?.province || 'BC',
                    postalCode: value,
                    coordinates: storeData.location?.coordinates || { lat: 0, lng: 0 }
                  }
                })}
              />
            </StageContainer>
          </div>
        )}

        {/* Stage 3: Contact Information */}
        {currentStage === 3 && (
          <div className="animate-[slideInRight_0.5s_ease-out]">
            <StageContainer stage={getStageById(3)!}>
              <ContactInfoStage
                phone={storeData.phone || ''}
                email={storeData.email || ''}
                website={storeData.website || ''}
                instagram={storeData.instagram || ''}
                facebook={storeData.facebook || ''}
                deliveryHours={storeData.deliveryHours || {}}
                lowStockThreshold={storeData.lowStockThreshold ?? 10}
                onPhoneChange={(value) => setStoreData({ ...storeData, phone: value })}
                onEmailChange={(value) => setStoreData({ ...storeData, email: value })}
                onWebsiteChange={(value) => setStoreData({ ...storeData, website: value })}
                onInstagramChange={(value) => setStoreData({ ...storeData, instagram: value })}
                onFacebookChange={(value) => setStoreData({ ...storeData, facebook: value })}
                onDeliveryHoursChange={(hours) => setStoreData({ ...storeData, deliveryHours: hours })}
                onLowStockThresholdChange={(value) => setStoreData({ ...storeData, lowStockThreshold: value })}
              />
            </StageContainer>
          </div>
        )}

        {/* Stage 4: Service Agreement */}
        {currentStage === 4 && (
          <div className="animate-[slideInRight_0.5s_ease-out]">
            <StageContainer stage={getStageById(4)!}>
              <ServiceAgreementStage
                storeName={storeData.name}
                agreed={agreementAccepted}
                onAgreeChange={setAgreementAccepted}
              />
            </StageContainer>
          </div>
        )}

        {/* Stage 5: Pricing Confirmation */}
        {currentStage === 5 && (
          <div className="animate-[slideInRight_0.5s_ease-out]">
            <StageContainer stage={getStageById(5)!}>
              <PricingConfirmationStage
                confirmed={pricingConfirmed}
                onConfirmChange={setPricingConfirmed}
              />
            </StageContainer>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStage > 1 && (
                <button
                  type="button"
                  onClick={prevStage}
                  className="btn-ghost inline-flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('store.previous')}
                </button>
              )}

              {onCancel && currentStage === 1 && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn-ghost inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('store.cancel')}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStage < TOTAL_STAGES ? (
                <button
                  type="button"
                  onClick={nextStage}
                  className="btn-primary inline-flex items-center gap-2 font-medium"
                >
                  {t('store.nextStage')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {saving ? t('store.saving') : t('store.save')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Validation Error Display - Bottom of screen for better visibility */}
        {validationError && (
          <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-4 flex items-center gap-3 shadow-lg sticky bottom-4">
            <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
            <span className="text-orange-800 font-medium">{validationError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
