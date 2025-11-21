import { useEffect } from 'react';
import { useCheckoutStore } from '../../../stores/checkoutStore';
import { useAuth } from '../../../context/AuthContext';

interface UseCheckoutFlowOptions {
  onOpenCheckout?: () => void;
}

interface UseCheckoutFlowReturn {
  shouldOpenCheckout: boolean;
  triggerCheckout: () => void;
  closeCheckout: () => void;
}

/**
 * useCheckoutFlow Hook
 *
 * Manages checkout flow, especially post-login redirect to checkout
 * Replaces window event-based communication with Zustand store
 *
 * @param onOpenCheckout - Optional callback when checkout should open
 *
 * @returns Checkout state and control functions
 */
export const useCheckoutFlow = ({
  onOpenCheckout,
}: UseCheckoutFlowOptions = {}): UseCheckoutFlowReturn => {
  const { shouldOpenCheckout, triggerCheckout, closeCheckout } = useCheckoutStore();
  const { refreshUserProfile } = useAuth();

  /**
   * Listen for profile updates and refresh user data
   * Replaces window 'profileUpdated' event listener
   */
  useEffect(() => {
    const handleProfileUpdated = async () => {
      try {
        await refreshUserProfile();
      } catch (error) {
        console.error('Error refreshing profile after profile update:', error);
      }
    };

    // Keep window event for backward compatibility during migration
    window.addEventListener('profileUpdated', handleProfileUpdated);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdated);
  }, [refreshUserProfile]);

  /**
   * Trigger checkout open callback when shouldOpenCheckout changes
   */
  useEffect(() => {
    if (shouldOpenCheckout && onOpenCheckout) {
      onOpenCheckout();
    }
  }, [shouldOpenCheckout, onOpenCheckout]);

  return {
    shouldOpenCheckout,
    triggerCheckout,
    closeCheckout,
  };
};
