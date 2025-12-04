/**
 * useCheckoutProfileAddress - Manages profile address pre-fill and auto-apply
 *
 * Checks if user has a saved address in their profile and provides
 * functionality to apply it to the checkout form.
 */

import { useMemo, useCallback, useEffect } from 'react';
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
}

interface UseCheckoutProfileAddressReturn {
  /** Whether user has a complete saved address in their profile */
  hasSavedAddress: boolean;
  /** Apply profile address to form and skip to review step */
  applyProfileAddressAndSkipToReview: () => void;
}

export function useCheckoutProfileAddress({
  currentUser,
  userProfile,
  formData,
  setEntireFormData,
  goToStep,
}: UseCheckoutProfileAddressProps): UseCheckoutProfileAddressReturn {
  // Check if user has a saved address in their profile
  const hasSavedAddress = useMemo(() => {
    const location = userProfile?.preferences?.defaultLocation;
    return !!(location?.address && location?.city && location?.province && location?.postalCode);
  }, [userProfile]);

  // Apply profile address to form and skip to review step
  const applyProfileAddressAndSkipToReview = useCallback(() => {
    const location = userProfile?.preferences?.defaultLocation;
    if (!location) return;

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

    // Skip address step and go directly to review
    goToStep('review');
  }, [userProfile, setEntireFormData, goToStep]);

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
  };
}
