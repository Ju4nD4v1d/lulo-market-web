import type * as React from 'react';
import { useState, useEffect } from 'react';
import { FileText, Wallet, Handshake, RotateCcw, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useStore } from '../../../../context/StoreContext';
import { getStoreAcceptances } from '../../../../services/api';
import type { StoreAcceptance } from '../../../../services/api';
import styles from './DocumentsPage.module.css';

interface DocumentCard {
  id: string;
  acceptanceKey: keyof Pick<StoreAcceptance, 'sellerAgreement' | 'payoutPolicy' | 'refundPolicy'>;
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  href: string;
}

const documents: DocumentCard[] = [
  {
    id: 'seller-agreement',
    acceptanceKey: 'sellerAgreement',
    icon: Handshake,
    titleKey: 'documents.sellerAgreement',
    descriptionKey: 'documents.sellerAgreementDesc',
    href: '#seller-agreement'
  },
  {
    id: 'payout-policy',
    acceptanceKey: 'payoutPolicy',
    icon: Wallet,
    titleKey: 'documents.payoutPolicy',
    descriptionKey: 'documents.payoutPolicyDesc',
    href: '#payout-policy'
  },
  {
    id: 'refund-policy',
    acceptanceKey: 'refundPolicy',
    icon: RotateCcw,
    titleKey: 'documents.refundPolicy',
    descriptionKey: 'documents.refundPolicyDesc',
    href: '#refund-policy'
  }
];

export const DocumentsPage: React.FC = () => {
  const { t, locale } = useLanguage();
  const { storeId } = useStore();
  const [acceptances, setAcceptances] = useState<StoreAcceptance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchAcceptances = async () => {
      if (!storeId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getStoreAcceptances(storeId);
        if (!isCancelled) {
          setAcceptances(data);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching acceptances:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchAcceptances();

    return () => {
      isCancelled = true;
    };
  }, [storeId]);

  const handleDocumentClick = (href: string) => {
    // Set back navigation path so legal pages know to return here
    localStorage.setItem('backNavigationPath', '#dashboard/documents');
    window.location.hash = href;
  };

  const formatAcceptanceDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAcceptanceInfo = (acceptanceKey: DocumentCard['acceptanceKey']) => {
    if (!acceptances) return null;
    const acceptance = acceptances[acceptanceKey];
    return acceptance;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FileText className={styles.icon} />
        </div>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('documents.title')}</h1>
          <p className={styles.subtitle}>{t('documents.subtitle')}</p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className={styles.documentsGrid}>
        {documents.map((doc) => {
          const IconComponent = doc.icon;
          const acceptance = getAcceptanceInfo(doc.acceptanceKey);
          const isAccepted = acceptance?.accepted;
          const acceptedAt = acceptance?.acceptedAt;

          return (
            <div
              key={doc.id}
              className={`${styles.documentCard} ${isAccepted ? styles.documentCardAccepted : ''}`}
              onClick={() => handleDocumentClick(doc.href)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleDocumentClick(doc.href);
                }
              }}
            >
              <div className={styles.cardIcon}>
                <IconComponent className={styles.docIcon} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{t(doc.titleKey)}</h3>
                <p className={styles.cardDescription}>{t(doc.descriptionKey)}</p>
              </div>

              {/* Acceptance Status */}
              {!loading && storeId && (
                <div className={`${styles.acceptanceStatus} ${isAccepted ? styles.acceptanceStatusAccepted : ''}`}>
                  {isAccepted ? (
                    <>
                      <CheckCircle className={styles.statusIcon} />
                      <span className={styles.statusText}>
                        {t('documents.acceptedOn')} {formatAcceptanceDate(acceptedAt || null)}
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className={styles.statusIconPending} />
                      <span className={styles.statusTextPending}>{t('documents.notAccepted')}</span>
                    </>
                  )}
                </div>
              )}

              <div className={styles.cardAction}>
                <span className={styles.viewLink}>
                  {t('documents.viewDocument')}
                  <ExternalLink className={styles.linkIcon} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsPage;
