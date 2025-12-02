/**
 * Hook to handle Stripe Connect return from onboarding
 *
 * Handles both success and refresh return scenarios:
 * - success: Shows success message and refreshes store data
 * - refresh: Redirects back to Stripe to complete onboarding
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../../../context/StoreContext';
import {
  createStripeAccountLink,
  getStripeConnectReturnUrls,
} from '../../../services/api/stripeConnectApi';

type StripeReturnStatus = 'idle' | 'verifying' | 'success' | 'needs_info' | 'error';

interface UseStripeConnectReturnResult {
  status: StripeReturnStatus;
  message: string | null;
  clearStatus: () => void;
}

export function useStripeConnectReturn(): UseStripeConnectReturnResult {
  const { store, refreshStoreStatus } = useStore();
  const [status, setStatus] = useState<StripeReturnStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const processedRef = useRef(false);

  const clearStatus = useCallback(() => {
    setStatus('idle');
    setMessage(null);
  }, []);

  useEffect(() => {
    // Only process once
    if (processedRef.current) return;

    // Check for stripe query param in hash
    const hash = window.location.hash;
    const match = hash.match(/[?&]stripe=(success|refresh)/);

    if (!match) return;

    // Need store ID to proceed
    if (!store?.id) return;

    const stripeAction = match[1];
    processedRef.current = true;

    // Clean up the URL by removing the stripe param
    const cleanHash = hash.replace(/[?&]stripe=(success|refresh)/, '').replace(/\?$/, '');
    window.history.replaceState(null, '', window.location.pathname + cleanHash);

    if (stripeAction === 'success') {
      handleSuccess();
    } else if (stripeAction === 'refresh') {
      handleRefresh();
    }
  }, [store?.id]);

  const handleSuccess = async () => {
    // User returned from Stripe onboarding - refresh store data to get actual status
    // Don't show success message here - let PaymentSettings and StripeConnectBanner
    // show the actual status (which may still require action)
    setStatus('verifying');

    try {
      await refreshStoreStatus();
    } catch (err) {
      console.error('Error refreshing store status:', err);
    }

    // Clear verifying status after refresh completes
    setStatus('idle');
    setMessage(null);
  };

  const handleRefresh = async () => {
    // User needs to continue onboarding - redirect them back
    setStatus('verifying');

    // First refresh to get latest store data with stripeAccountId
    try {
      await refreshStoreStatus();
    } catch (err) {
      console.error('Error refreshing store status:', err);
    }

    // Wait a moment for state to update
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!store?.id || !store?.stripeAccountId) {
      setStatus('error');
      setMessage('stripeConnect.return.noAccount');
      return;
    }

    try {
      const { returnUrl, refreshUrl } = getStripeConnectReturnUrls();

      const result = await createStripeAccountLink({
        storeId: store.id,
        accountId: store.stripeAccountId,
        returnUrl,
        refreshUrl,
      });

      if (result.success && result.data?.url) {
        // Redirect back to Stripe
        window.location.href = result.data.url;
      } else {
        setStatus('error');
        setMessage(result.error || 'stripeConnect.return.refreshFailed');
      }
    } catch (err) {
      console.error('Error creating Stripe account link:', err);
      setStatus('error');
      setMessage('stripeConnect.return.refreshFailed');
    }
  };

  return { status, message, clearStatus };
}
