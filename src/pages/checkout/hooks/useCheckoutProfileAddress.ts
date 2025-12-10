/**
 * useCheckoutProfileAddress - Manages profile address pre-fill and auto-apply
 *
 * Checks if user has a saved address in their profile and provides
 * functionality to apply it to the checkout form.
 */

import { useMemo, useCallback, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../../../types/user';

interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface FormData {
  customerInfo: CustomerInfo;
  useProfileAsDeliveryContact: boolean;
}

interface UseCheckoutProfileAddressProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  formData: FormData;
  setEntireFormData: (data: Partial<{ customerInfo: CustomerInfo; deliveryAddress: DeliveryAddress }>) => void;
  goToStep: (step: 'customer-info' | 'address' | 'review' | 'payment') => void;
  /** Calculate delivery fee for address - accepts optional address override to avoid stale state issues */
  calculateDeliveryFeeForAddress: (addressOverride?: DeliveryAddress) => Promise<boolean>;
}

interface UseCheckoutProfileAddressReturn {
  /** Whether user has a complete saved address in their profile */
  hasSavedAddress: boolean;
  /** Apply profile address to form and skip to review step (calculates delivery fee first) */
  applyProfileAddressAndSkipToReview: () => Promise<void>;
  /** Whether the address application is in progress */
  isApplyingProfileAddress: boolean;
}

export function useCheckoutProfileAddress({
  currentUser,
  userProfile,
  formData,
  setEntireFormData,
  goToStep,
  calculateDeliveryFeeForAddress,
}: UseCheckoutProfileAddressProps): UseCheckoutProfileAddressReturn {
  const [isApplyingProfileAddress, setIsApplyingProfileAddress] = useState(false);

  // Check if user has a saved address in their profile
  const hasSavedAddress = useMemo(() => {
    const location = userProfile?.preferences?.defaultLocation;
    return !!(location?.address && location?.city && location?.province && location?.postalCode);
  }, [userProfile]);

  // Apply profile address to form, calculate delivery fee, and skip to review step
  const applyProfileAddressAndSkipToReview = useCallback(async () => {
    const location = userProfile?.preferences?.defaultLocation;
    if (!location) return;

    setIsApplyingProfileAddress(true);

    try {
      // Parse the address - the location.address may be a full formatted string
      // Extract components if available
      const addressData: DeliveryAddress = {
        street: location.address || '',
        city: location.city || '',
        province: location.province || '',
        postalCode: location.postalCode || '',
        country: 'CA',
      };

      // Update the delivery address form data
      setEntireFormData({
        deliveryAddress: addressData,
      });

      // Calculate delivery fee BEFORE skipping to review
      // Pass addressData directly to avoid race condition with React state updates
      // (setEntireFormData is async/batched, so form state may not be updated yet)
      const feeCalculationSuccess = await calculateDeliveryFeeForAddress(addressData);

      if (feeCalculationSuccess) {
        // Only skip to review if fee calculation succeeded
        goToStep('review');
      } else {
        // If fee calculation failed, go to address step so user can see the error
        goToStep('address');
      }
    } finally {
      setIsApplyingProfileAddress(false);
    }
  }, [userProfile, setEntireFormData, goToStep, calculateDeliveryFeeForAddress]);

  // Auto-fill customer info from user profile when useProfileAsDeliveryContact is enabled
  // Prioritize userProfile (Firestore) over currentUser (Firebase Auth)
  useEffect(() => {
    if ((currentUser || userProfile) && formData.useProfileAsDeliveryContact) {
      setEntireFormData({
        customerInfo: {
          name: userProfile?.displayName || currentUser?.displayName || formData.customerInfo.name,
          email: userProfile?.email || currentUser?.email || formData.customerInfo.email,
          phone: userProfile?.phoneNumber || currentUser?.phoneNumber || formData.customerInfo.phone,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, userProfile, formData.useProfileAsDeliveryContact]);

  return {
    hasSavedAddress,
    applyProfileAddressAndSkipToReview,
    isApplyingProfileAddress,
  };
}
