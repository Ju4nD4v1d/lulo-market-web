/**
 * AgreementModal Component
 *
 * Modal for viewing and accepting legal agreements inline
 * Features:
 * - Scrollable agreement content
 * - Must scroll to bottom before accepting
 * - Accept checkbox and button
 */

import type * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import { useLatestAgreementQuery } from '../../../../../hooks/queries/useLegalAgreementQuery';
import type { AgreementType } from '../../../../../services/api/types';
import styles from './AgreementModal.module.css';

interface AgreementModalProps {
  isOpen: boolean;
  agreementType: AgreementType;
  onClose: () => void;
  onAccept: (agreementType: AgreementType, versionId: string, version: string) => Promise<void>;
}

export const AgreementModal: React.FC<AgreementModalProps> = ({
  isOpen,
  agreementType,
  onClose,
  onAccept,
}) => {
  const { t, locale } = useLanguage();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch the latest agreement
  const { data: agreement, isLoading, isError } = useLatestAgreementQuery(agreementType);

  // Reset state when modal opens/closes or agreement changes
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setIsChecked(false);
      setAcceptError(null);
    }
  }, [isOpen, agreementType]);

  // Check if user has scrolled to the bottom
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      // Allow some tolerance (within 10px of bottom)
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolledToBottom(true);
      }
    }
  };

  // Check scroll position on content load
  useEffect(() => {
    if (contentRef.current && agreement) {
      const { scrollHeight, clientHeight } = contentRef.current;
      // If content fits without scrolling, auto-enable
      if (scrollHeight <= clientHeight) {
        setHasScrolledToBottom(true);
      }
    }
  }, [agreement]);

  const handleAccept = async () => {
    if (!agreement || !isChecked) return;

    setIsAccepting(true);
    setAcceptError(null);

    try {
      await onAccept(agreementType, agreement.id, agreement.version);
      onClose();
    } catch (err) {
      console.error('Error accepting agreement:', err);
      setAcceptError(t('documents.modal.acceptError'));
    } finally {
      setIsAccepting(false);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = agreement?.content?.[locale as 'en' | 'es'] || agreement?.content?.en || '';
  const title = agreement?.title?.[locale as 'en' | 'es'] || agreement?.title?.en || '';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title || t('documents.modal.loading')}</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className={styles.content}
          onScroll={handleScroll}
        >
          {isLoading && (
            <div className={styles.loadingState}>
              <Loader2 className={styles.spinner} size={32} />
              <p>{t('common.loading')}</p>
            </div>
          )}

          {isError && (
            <div className={styles.errorState}>
              <AlertCircle size={32} />
              <p>{t('documents.modal.loadError')}</p>
            </div>
          )}

          {!isLoading && !isError && agreement && (
            <pre className={styles.agreementText}>{content}</pre>
          )}
        </div>

        {/* Scroll hint */}
        {!hasScrolledToBottom && !isLoading && !isError && (
          <div className={styles.scrollHint}>
            {t('documents.modal.scrollToRead')}
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          {acceptError && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              {acceptError}
            </div>
          )}

          <label className={`${styles.checkboxLabel} ${!hasScrolledToBottom ? styles.disabled : ''}`}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              disabled={!hasScrolledToBottom || isLoading || isError}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              {t('documents.modal.agreeCheckbox')}
            </span>
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isAccepting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className={styles.acceptButton}
              onClick={handleAccept}
              disabled={!isChecked || !hasScrolledToBottom || isAccepting || isLoading || isError}
            >
              {isAccepting ? (
                <>
                  <Loader2 className={styles.buttonSpinner} size={16} />
                  {t('documents.modal.accepting')}
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  {t('documents.modal.acceptButton')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementModal;
