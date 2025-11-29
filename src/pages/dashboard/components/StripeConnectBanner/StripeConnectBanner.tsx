/**
 * StripeConnectBanner - Shows Stripe account status to store owners
 *
 * Displays different banners based on account status:
 * - No account: Warning to connect
 * - pending_onboarding: Warning to complete setup
 * - pending_verification: Info that Stripe is reviewing
 * - restricted: Warning that action is required
 * - enabled: Hidden (all good!)
 * - disabled: Error that account is disconnected
 */

import { useState } from 'react';
import { AlertTriangle, CreditCard, ExternalLink, Loader2, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useStore } from '../../../../context/StoreContext';
import { useAuth } from '../../../../context/AuthContext';
import {
  createStripeConnectAccount,
  createStripeAccountLink,
  getStripeConnectReturnUrls,
} from '../../../../services/api/stripeConnectApi';
import { getStoreByOwnerWithData } from '../../../../services/api/storeApi';
import { StripeAccountStatus } from '../../../../types/store';
import styles from './StripeConnectBanner.module.css';

interface StripeConnectBannerProps {
  stripeAccountId?: string | null;
  stripeEnabled?: boolean;
  stripeAccountStatus?: StripeAccountStatus;
  stripeDetailsSubmitted?: boolean;
}

export const StripeConnectBanner: React.FC<StripeConnectBannerProps> = ({
  stripeAccountId,
  stripeEnabled,
  stripeAccountStatus,
  stripeDetailsSubmitted,
}) => {
  const { t } = useLanguage();
  const { store, refreshStoreStatus } = useStore();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if fully enabled
  if (stripeAccountStatus === 'enabled' || (stripeEnabled && stripeDetailsSubmitted)) {
    return null;
  }

  // Don't show if dismissed (for this session only)
  if (isDismissed) {
    return null;
  }

  // Don't show if no store data
  if (!store?.id) {
    return null;
  }

  const handleConnectStripe = async () => {
    if (!store?.id || !currentUser?.email || !currentUser?.uid) {
      setError(t('stripeConnect.error.missingData'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { returnUrl, refreshUrl } = getStripeConnectReturnUrls();

      // If we have an account but need to complete onboarding or fix issues, create account link
      if (stripeAccountId && stripeAccountStatus !== 'enabled') {
        const result = await createStripeAccountLink({
          storeId: store.id,
          accountId: stripeAccountId,
          returnUrl,
          refreshUrl,
        });

        if (result.success && result.data?.url) {
          window.location.href = result.data.url;
          return;
        } else {
          setError(result.error || t('stripeConnect.error.linkFailed'));
          setIsLoading(false);
          return;
        }
      }

      // Try to create new Stripe Connect account
      const result = await createStripeConnectAccount({
        storeId: store.id,
        storeName: store.name || 'My Store',
        ownerEmail: currentUser.email,
        returnUrl,
        refreshUrl,
      });

      if (result.success && result.data?.onboardingUrl) {
        window.location.href = result.data.onboardingUrl;
      } else if (result.error?.toLowerCase().includes('already has')) {
        // Store already has a Stripe account - fetch fresh data and create account link
        const freshStoreData = await getStoreByOwnerWithData(currentUser.uid);

        if (freshStoreData.storeData?.stripeAccountId) {
          const linkResult = await createStripeAccountLink({
            storeId: store.id,
            accountId: freshStoreData.storeData.stripeAccountId,
            returnUrl,
            refreshUrl,
          });

          if (linkResult.success && linkResult.data?.url) {
            window.location.href = linkResult.data.url;
            return;
          } else {
            setError(linkResult.error || t('stripeConnect.error.linkFailed'));
            setIsLoading(false);
          }
        } else {
          setError(t('stripeConnect.error.linkFailed'));
          setIsLoading(false);
        }
      } else {
        setError(result.error || t('stripeConnect.error.createFailed'));
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error connecting Stripe:', err);
      setError(t('stripeConnect.error.unexpected'));
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsLoading(true);
    try {
      await refreshStoreStatus();
    } catch (err) {
      console.error('Error refreshing status:', err);
    }
    setIsLoading(false);
  };

  // Determine banner variant based on status
  const getBannerConfig = () => {
    // No account at all
    if (!stripeAccountId) {
      return {
        variant: 'warning' as const,
        icon: AlertTriangle,
        title: t('stripeConnect.required.title'),
        description: t('stripeConnect.required.description'),
        buttonText: t('stripeConnect.connectButton'),
        buttonIcon: ExternalLink,
        showAction: true,
        canDismiss: true,
      };
    }

    switch (stripeAccountStatus) {
      case 'pending_onboarding':
        return {
          variant: 'warning' as const,
          icon: AlertTriangle,
          title: t('stripeConnect.pending.title'),
          description: t('stripeConnect.pending.description'),
          buttonText: t('stripeConnect.completeSetup'),
          buttonIcon: CheckCircle,
          showAction: true,
          canDismiss: false,
        };

      case 'pending_verification':
        return {
          variant: 'info' as const,
          icon: Clock,
          title: t('stripeConnect.verification.title'),
          description: t('stripeConnect.verification.description'),
          buttonText: t('stripeConnect.refreshStatus'),
          buttonIcon: null,
          showAction: true,
          canDismiss: true,
          isRefreshAction: true,
        };

      case 'restricted':
        return {
          variant: 'warning' as const,
          icon: AlertCircle,
          title: t('stripeConnect.restricted.title'),
          description: t('stripeConnect.restricted.description'),
          buttonText: t('stripeConnect.fixIssues'),
          buttonIcon: ExternalLink,
          showAction: true,
          canDismiss: false,
        };

      case 'disabled':
        return {
          variant: 'error' as const,
          icon: AlertCircle,
          title: t('stripeConnect.disabled.title'),
          description: t('stripeConnect.disabled.description'),
          buttonText: t('stripeConnect.reconnect'),
          buttonIcon: ExternalLink,
          showAction: true,
          canDismiss: false,
        };

      default:
        // Fallback for unknown status - treat as needing setup
        return {
          variant: 'warning' as const,
          icon: AlertTriangle,
          title: t('stripeConnect.pending.title'),
          description: t('stripeConnect.pending.description'),
          buttonText: t('stripeConnect.completeSetup'),
          buttonIcon: CheckCircle,
          showAction: true,
          canDismiss: false,
        };
    }
  };

  const config = getBannerConfig();
  const IconComponent = config.icon;
  const ButtonIcon = config.buttonIcon;

  const getVariantClass = () => {
    switch (config.variant) {
      case 'info':
        return styles.bannerInfo;
      case 'error':
        return styles.bannerError;
      case 'warning':
      default:
        return styles.bannerWarning;
    }
  };

  return (
    <div className={`${styles.banner} ${getVariantClass()}`}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <IconComponent className={styles.icon} />
        </div>

        <div className={styles.textContent}>
          <h3 className={styles.title}>{config.title}</h3>
          <p className={styles.description}>{config.description}</p>
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.actions}>
          {config.showAction && (
            <button
              onClick={config.isRefreshAction ? handleRefreshStatus : handleConnectStripe}
              disabled={isLoading}
              className={styles.connectButton}
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.buttonIcon} />
                  {t('stripeConnect.connecting')}
                </>
              ) : (
                <>
                  {ButtonIcon && <ButtonIcon className={styles.buttonIcon} />}
                  {config.buttonText}
                </>
              )}
            </button>
          )}

          {config.canDismiss && (
            <button
              onClick={() => setIsDismissed(true)}
              className={styles.dismissButton}
              aria-label={t('common.dismiss')}
            >
              <X className={styles.dismissIcon} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
