/**
 * StoreInfoTab - Store details including Stripe account info
 * Shows store info, contact, Stripe status, and owner info
 */

import { useState } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Globe,
  Mail,
  CreditCard,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  User,
  Calendar,
  Trash2,
  Loader2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useAuth } from '../../../../context/AuthContext';
import { deleteStripeAccount } from '../../../../services/api/adminApi';
import type { StoreData } from '../../../../types/store';
import styles from './StoreInfoTab.module.css';

interface StoreInfoTabProps {
  store: StoreData;
  onRefresh: () => void;
}

export const StoreInfoTab = ({ store, onRefresh }: StoreInfoTabProps) => {
  const { t, locale } = useLanguage();
  const { currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyAccountId = async () => {
    if (!store.stripeAccountId) return;
    try {
      await navigator.clipboard.writeText(store.stripeAccountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStripeDashboardUrl = (accountId: string) => {
    return `https://dashboard.stripe.com/connect/accounts/${accountId}`;
  };

  const handleDeleteStripeAccount = async () => {
    if (!store.stripeAccountId || !currentUser) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteStripeAccount({
        storeId: store.id,
        accountId: store.stripeAccountId,
        adminUserId: currentUser.uid
      });

      if (result.success) {
        setShowDeleteConfirm(false);
        onRefresh();
      } else {
        setDeleteError(result.error || t('admin.storeInfo.deleteError'));
      }
    } catch (err) {
      console.error('Delete Stripe account error:', err);
      setDeleteError(t('admin.storeInfo.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStripeStatusBadge = () => {
    if (!store.stripeAccountId) {
      return { text: t('paymentSettings.badge.notSetup'), class: styles.badgeWarning };
    }
    if (store.stripeEnabled) {
      return { text: t('paymentSettings.badge.active'), class: styles.badgeSuccess };
    }
    switch (store.stripeAccountStatus) {
      case 'pending_verification':
        return { text: t('paymentSettings.badge.underReview'), class: styles.badgeInfo };
      case 'restricted':
        return { text: t('paymentSettings.badge.actionRequired'), class: styles.badgeWarning };
      case 'disabled':
        return { text: t('paymentSettings.badge.disabled'), class: styles.badgeError };
      default:
        return { text: t('paymentSettings.badge.incomplete'), class: styles.badgeWarning };
    }
  };

  const statusBadge = getStripeStatusBadge();

  return (
    <div className={styles.container}>
      {/* Basic Information */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Store className={styles.sectionIcon} />
          {t('admin.storeInfo.basicInfo')}
        </h2>
        <div className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>{t('store.dashboard.storeName')}</label>
              <p className={styles.value}>{store.name}</p>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('store.dashboard.cuisine')}</label>
              <p className={styles.value}>
                {store.cuisine ? t(`store.cuisine.${store.cuisine}`) : '—'}
              </p>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t('store.dashboard.description')}</label>
            <p className={styles.value}>{store.description || '—'}</p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Phone className={styles.sectionIcon} />
          {t('admin.storeInfo.contactInfo')}
        </h2>
        <div className={styles.card}>
          <div className={styles.contactList}>
            <div className={styles.contactItem}>
              <MapPin className={styles.contactIcon} />
              <div>
                <label className={styles.label}>{t('store.dashboard.address')}</label>
                <p className={styles.value}>{store.address || store.location?.address || '—'}</p>
              </div>
            </div>
            <div className={styles.contactItem}>
              <Phone className={styles.contactIcon} />
              <div>
                <label className={styles.label}>{t('store.dashboard.phone')}</label>
                <p className={styles.value}>{store.phone || '—'}</p>
              </div>
            </div>
            <div className={styles.contactItem}>
              <Globe className={styles.contactIcon} />
              <div>
                <label className={styles.label}>{t('store.dashboard.website')}</label>
                {store.website ? (
                  <a href={store.website} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    {store.website}
                    <ExternalLink className={styles.linkIcon} />
                  </a>
                ) : (
                  <p className={styles.value}>—</p>
                )}
              </div>
            </div>
            <div className={styles.contactItem}>
              <Mail className={styles.contactIcon} />
              <div>
                <label className={styles.label}>Email</label>
                <p className={styles.value}>{store.email || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stripe Account */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <CreditCard className={styles.sectionIcon} />
          {t('admin.storeInfo.stripeAccount')}
        </h2>
        <div className={styles.card}>
          <div className={styles.stripeHeader}>
            <span className={`${styles.badge} ${statusBadge.class}`}>
              {statusBadge.text}
            </span>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>{t('admin.storeInfo.stripeAccountId')}</label>
              {store.stripeAccountId ? (
                <div className={styles.accountIdRow}>
                  <code className={styles.accountId}>{store.stripeAccountId}</code>
                  <button
                    className={styles.copyButton}
                    onClick={handleCopyAccountId}
                    title={t('common.copy')}
                  >
                    {copied ? (
                      <Check className={styles.copyIcon} />
                    ) : (
                      <Copy className={styles.copyIcon} />
                    )}
                  </button>
                  <a
                    href={getStripeDashboardUrl(store.stripeAccountId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.stripeLink}
                    title={t('admin.storeInfo.viewInStripe')}
                  >
                    <ExternalLink className={styles.copyIcon} />
                  </a>
                </div>
              ) : (
                <p className={styles.value}>—</p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('admin.storeInfo.stripeStatus')}</label>
              <p className={styles.value}>{store.stripeAccountStatus || '—'}</p>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>{t('admin.storeInfo.chargesEnabled')}</label>
              <div className={styles.boolValue}>
                {store.stripeEnabled ? (
                  <><CheckCircle className={styles.boolIconYes} /> {t('common.yes')}</>
                ) : (
                  <><AlertCircle className={styles.boolIconNo} /> {t('common.no')}</>
                )}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('admin.storeInfo.payoutsEnabled')}</label>
              <div className={styles.boolValue}>
                {store.stripePayoutsEnabled ? (
                  <><CheckCircle className={styles.boolIconYes} /> {t('common.yes')}</>
                ) : (
                  <><AlertCircle className={styles.boolIconNo} /> {t('common.no')}</>
                )}
              </div>
            </div>
          </div>

          {store.stripeAccountId && (
            <div className={styles.stripeActions}>
              {showDeleteConfirm ? (
                <div className={styles.deleteConfirm}>
                  <AlertTriangle className={styles.deleteWarningIcon} />
                  <p className={styles.deleteMessage}>
                    {t('admin.storeInfo.deleteConfirmMessage')}
                  </p>
                  {deleteError && (
                    <p className={styles.deleteError}>{deleteError}</p>
                  )}
                  <div className={styles.deleteButtons}>
                    <button
                      className={styles.cancelButton}
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      className={styles.confirmDeleteButton}
                      onClick={handleDeleteStripeAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <><Loader2 className={styles.spinningIcon} /> {t('common.deleting')}</>
                      ) : (
                        <><Trash2 className={styles.buttonIcon} /> {t('common.delete')}</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className={styles.deleteButton}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className={styles.buttonIcon} />
                  {t('admin.storeInfo.deleteStripeAccount')}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Owner Information */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <User className={styles.sectionIcon} />
          {t('admin.storeInfo.ownerInfo')}
        </h2>
        <div className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>{t('admin.storeInfo.ownerId')}</label>
              <p className={`${styles.value} ${styles.mono}`}>{store.ownerId || '—'}</p>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('admin.storeInfo.ownerEmail')}</label>
              <p className={styles.value}>{store.ownerEmail || '—'}</p>
            </div>
          </div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>
                <Calendar className={styles.inlineIcon} />
                {t('admin.storeInfo.createdAt')}
              </label>
              <p className={styles.value}>{formatDate(store.createdAt)}</p>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <Calendar className={styles.inlineIcon} />
                {t('admin.storeInfo.updatedAt')}
              </label>
              <p className={styles.value}>{formatDate(store.updatedAt)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
