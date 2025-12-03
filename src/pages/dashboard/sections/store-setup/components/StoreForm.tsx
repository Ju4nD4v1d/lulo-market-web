/**
 * StoreForm Component (Refactored)
 *
 * Orchestrates the multi-stage store setup process
 * Uses the new scalable architecture with individual stage components
 *
 * In edit mode, the agreements stage (stage 4) is skipped since
 * agreements are only accepted once during initial store creation.
 */

import type * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import { StoreData } from '../../../../../types/store';
import { DEFAULT_MULTI_SLOT_SCHEDULE, DAYS_OF_WEEK } from '../../../../../types/schedule';
import { validateSchedule } from '../../../../../utils/scheduleUtils';
import { StageProgressBar } from './StageProgressBar';
import { StageContainer } from './StageContainer';
import { getStageById, STAGES } from '../config/stageConfig';
import {
  BasicInfoStage,
  AddressStage,
  ContactInfoStage,
  ServiceAgreementStage,
} from './stages';
import type { AgreementState } from './LegalAgreements';

// Stage ID for agreements (skipped when already accepted)
const AGREEMENTS_STAGE_ID = 4;

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
  onSave: (agreements: AgreementState) => void;
  onCancel?: () => void;
  saving: boolean;
  error: string | null;
  isEditMode?: boolean;
  agreementsAlreadyAccepted?: boolean;
  existingAcceptances?: AgreementState;
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
  error,
  isEditMode = false,
  agreementsAlreadyAccepted = false,
  existingAcceptances
}) => {
  const { t } = useLanguage();

  // Filter stages - skip agreements stage (4) ONLY if already accepted
  const activeStages = useMemo(() => {
    if (agreementsAlreadyAccepted) {
      return STAGES.filter(stage => stage.id !== AGREEMENTS_STAGE_ID);
    }
    return STAGES;
  }, [agreementsAlreadyAccepted]);

  const totalActiveStages = activeStages.length;

  // Map UI stage index (1-based) to actual stage ID
  const getStageIdFromIndex = (index: number): number => {
    return activeStages[index - 1]?.id ?? 1;
  };

  // Map actual stage ID to UI stage index (1-based)
  const getIndexFromStageId = (stageId: number): number => {
    const index = activeStages.findIndex(s => s.id === stageId);
    return index >= 0 ? index + 1 : 1;
  };

  const [currentStageIndex, setCurrentStageIndex] = useState(1);
  const currentStageId = getStageIdFromIndex(currentStageIndex);

  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  // Initialize agreements with existing acceptances (pre-check already accepted)
  const [agreements, setAgreements] = useState<AgreementState>({
    sellerAgreement: existingAcceptances?.sellerAgreement ?? false,
    payoutPolicy: existingAcceptances?.payoutPolicy ?? false,
    refundPolicy: existingAcceptances?.refundPolicy ?? false,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update agreements when existingAcceptances changes (e.g., after loading)
  useEffect(() => {
    if (existingAcceptances) {
      setAgreements(prev => ({
        sellerAgreement: existingAcceptances.sellerAgreement || prev.sellerAgreement,
        payoutPolicy: existingAcceptances.payoutPolicy || prev.payoutPolicy,
        refundPolicy: existingAcceptances.refundPolicy || prev.refundPolicy,
      }));
    }
  }, [existingAcceptances]);

  // Validate by stage ID (not index)
  const validateStageById = (stageId: number): string | null => {
    switch (stageId) {
      case 1: // Basic Info
        if (!storeData.name?.trim()) return t('store.validation.nameRequired');
        if (!storeData.category?.trim()) return t('store.validation.categoryRequired');
        if (!storeData.cuisine?.trim()) return t('store.validation.cuisineRequired');
        if (!storeData.description?.trim()) return t('store.validation.descriptionRequired');
        if (!storeImage.preview && !storeImage.url) return t('store.validation.imageRequired');
        return null;
      case 2: // Address
        if (!storeData.location?.address?.trim()) return t('store.validation.streetRequired');
        if (!storeData.location?.city?.trim()) return t('store.validation.cityRequired');
        if (!storeData.location?.province?.trim()) return t('store.validation.provinceRequired');
        if (!storeData.location?.postalCode?.trim()) return t('store.validation.postalCodeRequired');
        return null;
      case 3: // Contact Info
        if (!storeData.phone?.trim()) return t('store.validation.phoneRequired');
        if (!storeData.email?.trim()) return t('store.validation.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeData.email)) {
          return t('store.validation.emailInvalid');
        }
        // Validate schedule for errors (overlapping slots, invalid times)
        const schedule = storeData.deliverySchedule || DEFAULT_MULTI_SLOT_SCHEDULE;
        const scheduleErrors = validateSchedule(schedule);
        if (scheduleErrors.length > 0) {
          const firstError = scheduleErrors[0];
          if (firstError.type === 'overlap') return t('schedule.slotOverlap');
          if (firstError.type === 'invalid_time') return t('schedule.invalidTime');
          return t('schedule.slotOverlap'); // Default error
        }
        // Validate at least one delivery hour is set
        const hasDeliveryHours = DAYS_OF_WEEK.some(day => !schedule[day].closed && schedule[day].slots.length > 0);
        if (!hasDeliveryHours) return t('store.validation.deliveryHoursRequired');
        return null;
      case 4: // Agreements (shown only when not yet accepted)
        if (!agreements.sellerAgreement || !agreements.payoutPolicy || !agreements.refundPolicy) {
          return t('legal.agreements.allRequired');
        }
        return null;
      default:
        return null;
    }
  };

  const nextStage = () => {
    setValidationError(null);

    const error = validateStageById(currentStageId);
    if (error) {
      setValidationError(error);
      return;
    }

    setCompletedStages(prev => new Set(prev).add(currentStageId));
    setCurrentStageIndex(currentStageIndex + 1);
  };

  const prevStage = () => {
    if (currentStageIndex > 1) {
      setCurrentStageIndex(currentStageIndex - 1);
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
          currentStage={currentStageIndex}
          completedStages={completedStages}
          stages={activeStages}
        />

        {/* Stage 1: Basic Information */}
        {currentStageId === 1 && (
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
        {currentStageId === 2 && (
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
        {currentStageId === 3 && (
          <div className="animate-[slideInRight_0.5s_ease-out]">
            <StageContainer stage={getStageById(3)!}>
              <ContactInfoStage
                phone={storeData.phone || ''}
                email={storeData.email || ''}
                website={storeData.website || ''}
                instagram={storeData.instagram || ''}
                facebook={storeData.facebook || ''}
                deliverySchedule={storeData.deliverySchedule || DEFAULT_MULTI_SLOT_SCHEDULE}
                lowStockThreshold={storeData.lowStockThreshold ?? 10}
                onPhoneChange={(value) => setStoreData({ ...storeData, phone: value })}
                onEmailChange={(value) => setStoreData({ ...storeData, email: value })}
                onWebsiteChange={(value) => setStoreData({ ...storeData, website: value })}
                onInstagramChange={(value) => setStoreData({ ...storeData, instagram: value })}
                onFacebookChange={(value) => setStoreData({ ...storeData, facebook: value })}
                onDeliveryScheduleChange={(schedule) => setStoreData({ ...storeData, deliverySchedule: schedule })}
                onLowStockThresholdChange={(value) => setStoreData({ ...storeData, lowStockThreshold: value })}
              />
            </StageContainer>
          </div>
        )}

        {/* Stage 4: Service Agreement (shown only when not yet accepted) */}
        {currentStageId === 4 && (
          <div className="animate-[slideInRight_0.5s_ease-out]">
            <StageContainer stage={getStageById(4)!}>
              <ServiceAgreementStage
                agreements={agreements}
                onAgreementChange={setAgreements}
                existingAcceptances={existingAcceptances}
              />
            </StageContainer>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStageIndex > 1 && (
                <button
                  type="button"
                  onClick={prevStage}
                  className="btn-ghost inline-flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('store.previous')}
                </button>
              )}

              {onCancel && currentStageIndex === 1 && (
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
              {currentStageIndex < totalActiveStages ? (
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
                  onClick={() => onSave(agreements)}
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
