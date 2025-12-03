/**
 * PaymentSettings - Dedicated section for Stripe payment configuration
 *
 * Shows current payment status and allows store owners to manage their Stripe connection
 */

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertTriangle, AlertCircle, ExternalLink, RefreshCw, Loader2, FileText } from 'lucide-react';
import { useLanguage } from '../../../../../../context/LanguageContext';
import { useAuth } from '../../../../../../context/AuthContext';
import { getStoreStripeAccount } from '../../../../../../services/api/storeApi';
import { getStoreAcceptances } from '../../../../../../services/api/storeAcceptancesApi';
import {
  createStripeConnectAccount,
  createStripeAccountLink,
  createStripeLoginLink,
  getStripeConnectReturnUrls,
  verifyStripeConnectAccount,
} from '../../../../../../services/api/stripeConnectApi';
import styles from './PaymentSettings.module.css';

interface PaymentSettingsProps {
  storeId: string;
  storeName: string;
}

type AccountStatus = 'loading' | 'no_account' | 'pending_onboarding' | 'pending_verification' | 'restricted' | 'enabled' | 'disabled' | 'error';

interface StripeState {
  status: AccountStatus;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export const PaymentSettings: React.FC<PaymentSettingsProps> = ({ storeId, storeName }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [stripeState, setStripeState] = useState<StripeState>({
    status: 'loading',
    accountId: null,
    chargesEnabled: false,
    payoutsEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreementsAccepted, setAgreementsAccepted] = useState<boolean | null>(null);
  const [checkingAgreements, setCheckingAgreements] = useState(true);

  // Check if all agreements are accepted
  useEffect(() => {
    const checkAgreements = async () => {
      if (!storeId) {
        setCheckingAgreements(false);
        return;
      }

      try {
        const acceptances = await getStoreAcceptances(storeId);
        const allAccepted = !!(
          acceptances?.sellerAgreement?.accepted &&
          acceptances?.payoutPolicy?.accepted &&
          acceptances?.refundPolicy?.accepted
        );
        setAgreementsAccepted(allAccepted);
      } catch (err) {
        console.error('Error checking agreements:', err);
        setAgreementsAccepted(false);
      } finally {
        setCheckingAgreements(false);
      }
    };

    checkAgreements();
  }, [storeId]);

  // Fetch current status on mount and when storeId changes
  useEffect(() => {
    fetchStripeStatus();
  }, [storeId]);

  const fetchStripeStatus = async () => {
    if (!storeId) return;

    setStripeState(prev => ({ ...prev, status: 'loading' }));
    setError(null);

    try {
      const data = await getStoreStripeAccount(storeId);

      if (!data.stripeAccountId) {
        setStripeState({
          status: 'no_account',
          accountId: null,
          chargesEnabled: false,
          payoutsEnabled: false,
        });
        return;
      }

      // Verify with Stripe to get latest status
      const verifyResult = await verifyStripeConnectAccount({
        storeId,
        accountId: data.stripeAccountId,
      });

      if (verifyResult.success && verifyResult.data) {
        const { chargesEnabled, payoutsEnabled, detailsSubmitted, requiresMoreInfo } = verifyResult.data;

        let status: AccountStatus = 'pending_onboarding';
        if (chargesEnabled) {
          status = 'enabled';
        } else if (detailsSubmitted && !requiresMoreInfo) {
          status = 'pending_verification';
        } else if (requiresMoreInfo) {
          status = 'restricted';
        } else if (!detailsSubmitted) {
          status = 'pending_onboarding';
        }

        setStripeState({
          status,
          accountId: data.stripeAccountId,
          chargesEnabled,
          payoutsEnabled,
        });
      } else {
        // Use local data if verification fails
        setStripeState({
          status: (data.stripeAccountStatus as AccountStatus) || 'pending_onboarding',
          accountId: data.stripeAccountId,
          chargesEnabled: data.stripeEnabled,
          payoutsEnabled: false,
        });
      }
    } catch (err) {
      console.error('Error fetching Stripe status:', err);
      setStripeState(prev => ({ ...prev, status: 'error' }));
      setError(t('paymentSettings.error.fetchFailed'));
    }
  };

  const handleConnectStripe = async () => {
    if (!storeId || !currentUser?.email) {
      setError(t('paymentSettings.error.missingData'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { returnUrl, refreshUrl } = getStripeConnectReturnUrls();

      // For enabled accounts, use login link to access Express Dashboard
      if (stripeState.status === 'enabled' && stripeState.accountId) {
        const result = await createStripeLoginLink({
          storeId,
          accountId: stripeState.accountId,
        });

        if (result.success && result.data?.url) {
          window.open(result.data.url, '_blank');
          setIsLoading(false);
          return;
        } else {
          setError(result.error || t('paymentSettings.error.linkFailed'));
          setIsLoading(false);
          return;
        }
      }

      // For accounts that need onboarding/update, create account link
      if (stripeState.accountId) {
        const result = await createStripeAccountLink({
          storeId,
          accountId: stripeState.accountId,
          returnUrl,
          refreshUrl,
        });

        if (result.success && result.data?.url) {
          window.location.href = result.data.url;
          return;
        } else {
          setError(result.error || t('paymentSettings.error.linkFailed'));
          setIsLoading(false);
          return;
        }
      }

      // Create new account
      const result = await createStripeConnectAccount({
        storeId,
        storeName: storeName || 'My Store',
        ownerEmail: currentUser.email,
        returnUrl,
        refreshUrl,
      });

      if (result.success && result.data?.onboardingUrl) {
        window.location.href = result.data.onboardingUrl;
      } else {
        setError(result.error || t('paymentSettings.error.createFailed'));
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error connecting Stripe:', err);
      setError(t('paymentSettings.error.unexpected'));
      setIsLoading(false);
    }
  };

  const getStatusConfig = () => {
    switch (stripeState.status) {
      case 'loading':
        return {
          icon: Loader2,
          iconClass: styles.iconLoading,
          title: t('paymentSettings.status.loading'),
          description: '',
          statusBadge: null,
          showAction: false,
        };

      case 'no_account':
        return {
          icon: CreditCard,
          iconClass: styles.iconDefault,
          title: t('paymentSettings.status.notConnected'),
          description: t('paymentSettings.description.notConnected'),
          statusBadge: { text: t('paymentSettings.badge.notSetup'), class: styles.badgeWarning },
          showAction: true,
          actionText: t('paymentSettings.action.connect'),
          actionIcon: ExternalLink,
        };

      case 'pending_onboarding':
        return {
          icon: AlertTriangle,
          iconClass: styles.iconWarning,
          title: t('paymentSettings.status.incomplete'),
          description: t('paymentSettings.description.incomplete'),
          statusBadge: { text: t('paymentSettings.badge.incomplete'), class: styles.badgeWarning },
          showAction: true,
          actionText: t('paymentSettings.action.complete'),
          actionIcon: ExternalLink,
        };

      case 'pending_verification':
        return {
          icon: Clock,
          iconClass: styles.iconInfo,
          title: t('paymentSettings.status.underReview'),
          description: t('paymentSettings.description.underReview'),
          statusBadge: { text: t('paymentSettings.badge.underReview'), class: styles.badgeInfo },
          showAction: false,
        };

      case 'restricted':
        return {
          icon: AlertCircle,
          iconClass: styles.iconWarning,
          title: t('paymentSettings.status.actionRequired'),
          description: t('paymentSettings.description.actionRequired'),
          statusBadge: { text: t('paymentSettings.badge.actionRequired'), class: styles.badgeWarning },
          showAction: true,
          actionText: t('paymentSettings.action.fixIssues'),
          actionIcon: ExternalLink,
        };

      case 'enabled':
        return {
          icon: CheckCircle,
          iconClass: styles.iconSuccess,
          title: t('paymentSettings.status.active'),
          description: t('paymentSettings.description.active'),
          statusBadge: { text: t('paymentSettings.badge.active'), class: styles.badgeSuccess },
          showAction: true,
          actionText: t('paymentSettings.action.manage'),
          actionIcon: ExternalLink,
        };

      case 'disabled':
        return {
          icon: AlertCircle,
          iconClass: styles.iconError,
          title: t('paymentSettings.status.disabled'),
          description: t('paymentSettings.description.disabled'),
          statusBadge: { text: t('paymentSettings.badge.disabled'), class: styles.badgeError },
          showAction: true,
          actionText: t('paymentSettings.action.reconnect'),
          actionIcon: ExternalLink,
        };

      case 'error':
      default:
        return {
          icon: AlertCircle,
          iconClass: styles.iconError,
          title: t('paymentSettings.status.error'),
          description: t('paymentSettings.description.error'),
          statusBadge: { text: t('paymentSettings.badge.error'), class: styles.badgeError },
          showAction: false,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const handleGoToDocuments = () => {
    window.location.hash = '#dashboard/documents';
  };

  // Determine if Stripe actions should be disabled due to missing agreements
  const isBlockedByAgreements = agreementsAccepted === false && !checkingAgreements;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <CreditCard className={styles.titleIcon} />
          {t('paymentSettings.title')}
        </h2>
        <button
          onClick={fetchStripeStatus}
          disabled={stripeState.status === 'loading'}
          className={styles.refreshButton}
          aria-label={t('paymentSettings.refresh')}
        >
          <RefreshCw className={`${styles.refreshIcon} ${stripeState.status === 'loading' ? styles.spinning : ''}`} />
        </button>
      </div>

      {/* Agreement Warning Banner */}
      {isBlockedByAgreements && (
        <div className={styles.agreementWarning}>
          <div className={styles.agreementWarningContent}>
            <FileText className={styles.agreementWarningIcon} />
            <div className={styles.agreementWarningText}>
              <p className={styles.agreementWarningTitle}>
                {t('paymentSettings.agreementRequired.title')}
              </p>
              <p className={styles.agreementWarningDescription}>
                {t('paymentSettings.agreementRequired.description')}
              </p>
            </div>
          </div>
          <button
            onClick={handleGoToDocuments}
            className={styles.agreementWarningLink}
          >
            {t('paymentSettings.agreementRequired.link')}
            <ExternalLink className={styles.agreementWarningLinkIcon} />
          </button>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.statusCard}>
          <div className={`${styles.iconWrapper} ${config.iconClass}`}>
            <IconComponent className={styles.statusIcon} />
          </div>

          <div className={styles.statusInfo}>
            <div className={styles.statusHeader}>
              <h3 className={styles.statusTitle}>{config.title}</h3>
              {config.statusBadge && (
                <span className={`${styles.badge} ${config.statusBadge.class}`}>
                  {config.statusBadge.text}
                </span>
              )}
            </div>
            <p className={styles.statusDescription}>{config.description}</p>

            {stripeState.status === 'enabled' && (
              <div className={styles.capabilities}>
                <div className={styles.capability}>
                  <CheckCircle className={styles.capabilityIcon} />
                  <span>{t('paymentSettings.capability.charges')}</span>
                </div>
                {stripeState.payoutsEnabled && (
                  <div className={styles.capability}>
                    <CheckCircle className={styles.capabilityIcon} />
                    <span>{t('paymentSettings.capability.payouts')}</span>
                  </div>
                )}
              </div>
            )}

            {error && <p className={styles.error}>{error}</p>}
          </div>

          {config.showAction && (
            <div className={styles.actions}>
              <button
                onClick={handleConnectStripe}
                disabled={isLoading || isBlockedByAgreements}
                className={`${styles.actionButton} ${stripeState.status === 'enabled' ? styles.actionButtonSecondary : styles.actionButtonPrimary}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={styles.buttonIcon} />
                    {t('paymentSettings.connecting')}
                  </>
                ) : (
                  <>
                    {config.actionIcon && <config.actionIcon className={styles.buttonIcon} />}
                    {config.actionText}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
