import type * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Wallet, Handshake, RotateCcw, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useStore } from '../../../../context/StoreContext';
import { useAuth } from '../../../../context/AuthContext';
import { getStoreAcceptances, saveStoreAcceptances } from '../../../../services/api';
import type { StoreAcceptance } from '../../../../services/api';
import type { AgreementType } from '../../../../services/api/types';
import { AgreementModal } from './components/AgreementModal';
import { useDashboardNavigation } from '../../../../hooks/useDashboardNavigation';
import styles from './DocumentsPage.module.css';

interface DocumentCard {
  id: string;
  acceptanceKey: keyof Pick<StoreAcceptance, 'sellerAgreement' | 'payoutPolicy' | 'refundPolicy'>;
  agreementType: AgreementType;
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  href: string;
}

const documents: DocumentCard[] = [
  {
    id: 'seller-agreement',
    acceptanceKey: 'sellerAgreement',
    agreementType: 'sellerAgreement',
    icon: Handshake,
    titleKey: 'documents.sellerAgreement',
    descriptionKey: 'documents.sellerAgreementDesc',
    href: '#seller-agreement'
  },
  {
    id: 'payout-policy',
    acceptanceKey: 'payoutPolicy',
    agreementType: 'payoutPolicy',
    icon: Wallet,
    titleKey: 'documents.payoutPolicy',
    descriptionKey: 'documents.payoutPolicyDesc',
    href: '#payout-policy'
  },
  {
    id: 'refund-policy',
    acceptanceKey: 'refundPolicy',
    agreementType: 'refundPolicy',
    icon: RotateCcw,
    titleKey: 'documents.refundPolicy',
    descriptionKey: 'documents.refundPolicyDesc',
    href: '#refund-policy'
  }
];

export const DocumentsPage: React.FC = () => {
  const { t, locale } = useLanguage();
  const { storeId } = useStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { dashboardBase } = useDashboardNavigation();
  const [acceptances, setAcceptances] = useState<StoreAcceptance | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgreementType, setSelectedAgreementType] = useState<AgreementType | null>(null);

  const fetchAcceptances = useCallback(async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getStoreAcceptances(storeId);
      setAcceptances(data);
    } catch (err) {
      console.error('Error fetching acceptances:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    let isCancelled = false;

    const loadAcceptances = async () => {
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

    loadAcceptances();

    return () => {
      isCancelled = true;
    };
  }, [storeId]);

  const handleDocumentClick = (doc: DocumentCard) => {
    const acceptance = getAcceptanceInfo(doc.acceptanceKey);
    const isAccepted = acceptance?.accepted;
    const versionId = acceptance?.versionId;

    if (isAccepted) {
      // If already accepted, navigate to view the signed version
      localStorage.setItem('backNavigationPath', `${dashboardBase}/documents`);
      if (versionId) {
        navigate(`${doc.href.replace('#', '/')}?v=${versionId}`);
      } else {
        navigate(doc.href.replace('#', '/'));
      }
    } else {
      // If not accepted, open the modal
      setSelectedAgreementType(doc.agreementType);
      setModalOpen(true);
    }
  };

  const handleAcceptAgreement = async (
    agreementType: AgreementType,
    versionId: string,
    version: string
  ) => {
    if (!storeId || !currentUser?.uid) {
      throw new Error('Store ID and user ID are required');
    }

    // Build the acceptance input, preserving existing acceptances
    const existingSellerAgreement = acceptances?.sellerAgreement;
    const existingPayoutPolicy = acceptances?.payoutPolicy;
    const existingRefundPolicy = acceptances?.refundPolicy;

    await saveStoreAcceptances({
      storeId,
      ownerId: currentUser.uid,
      sellerAgreement: {
        accepted: agreementType === 'sellerAgreement' ? true : existingSellerAgreement?.accepted || false,
        versionId: agreementType === 'sellerAgreement' ? versionId : existingSellerAgreement?.versionId || null,
        version: agreementType === 'sellerAgreement' ? version : existingSellerAgreement?.version || null,
      },
      payoutPolicy: {
        accepted: agreementType === 'payoutPolicy' ? true : existingPayoutPolicy?.accepted || false,
        versionId: agreementType === 'payoutPolicy' ? versionId : existingPayoutPolicy?.versionId || null,
        version: agreementType === 'payoutPolicy' ? version : existingPayoutPolicy?.version || null,
      },
      refundPolicy: {
        accepted: agreementType === 'refundPolicy' ? true : existingRefundPolicy?.accepted || false,
        versionId: agreementType === 'refundPolicy' ? versionId : existingRefundPolicy?.versionId || null,
        version: agreementType === 'refundPolicy' ? version : existingRefundPolicy?.version || null,
      },
    });

    // Refresh acceptances after saving
    await fetchAcceptances();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAgreementType(null);
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
          const version = acceptance?.version;

          return (
            <div
              key={doc.id}
              className={`${styles.documentCard} ${isAccepted ? styles.documentCardAccepted : ''}`}
              onClick={() => handleDocumentClick(doc)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleDocumentClick(doc);
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
                        {version && (
                          <span className={styles.versionBadge}>
                            v{version}
                          </span>
                        )}
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
                  {isAccepted ? t('documents.viewDocument') : t('documents.reviewAndAccept')}
                  <ExternalLink className={styles.linkIcon} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agreement Modal */}
      {selectedAgreementType && (
        <AgreementModal
          isOpen={modalOpen}
          agreementType={selectedAgreementType}
          onClose={handleCloseModal}
          onAccept={handleAcceptAgreement}
        />
      )}
    </div>
  );
};

export default DocumentsPage;
