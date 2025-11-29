/**
 * OrphanAccountTool - Delete orphaned Stripe accounts not linked to any store
 */

import { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useAuth } from '../../../../context/AuthContext';
import { deleteOrphanStripeAccount } from '../../../../services/api/adminApi';
import styles from './OrphanAccountTool.module.css';

export const OrphanAccountTool = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [accountId, setAccountId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId.trim() || !accountId.startsWith('acct_')) {
      setResult({ success: false, message: t('admin.orphanTool.invalidAccountId') });
      return;
    }
    setResult(null);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentUser || !accountId.trim()) return;

    setIsDeleting(true);
    setResult(null);

    try {
      const response = await deleteOrphanStripeAccount({
        accountId: accountId.trim(),
        adminUserId: currentUser.uid,
      });

      if (response.success) {
        setResult({ success: true, message: t('admin.orphanTool.deleteSuccess') });
        setAccountId('');
        setShowConfirm(false);
      } else {
        setResult({ success: false, message: response.error || t('admin.orphanTool.deleteError') });
      }
    } catch (err) {
      console.error('Delete orphan account error:', err);
      setResult({ success: false, message: t('admin.orphanTool.deleteError') });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setResult(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Trash2 className={styles.headerIcon} />
        <div>
          <h3 className={styles.title}>{t('admin.orphanTool.title')}</h3>
          <p className={styles.description}>{t('admin.orphanTool.description')}</p>
        </div>
      </div>

      {!showConfirm ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('admin.orphanTool.accountIdLabel')}</label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="acct_xxxxxxxxxx"
              className={styles.input}
            />
          </div>
          <button
            type="submit"
            disabled={!accountId.trim()}
            className={styles.submitButton}
          >
            <Trash2 className={styles.buttonIcon} />
            {t('admin.orphanTool.deleteButton')}
          </button>
        </form>
      ) : (
        <div className={styles.confirmBox}>
          <AlertTriangle className={styles.warningIcon} />
          <p className={styles.confirmMessage}>
            {t('admin.orphanTool.confirmMessage')}
          </p>
          <code className={styles.accountIdDisplay}>{accountId}</code>
          <div className={styles.confirmButtons}>
            <button
              onClick={handleCancel}
              disabled={isDeleting}
              className={styles.cancelButton}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className={styles.confirmDeleteButton}
            >
              {isDeleting ? (
                <>
                  <Loader2 className={styles.spinningIcon} />
                  {t('common.deleting')}
                </>
              ) : (
                <>
                  <Trash2 className={styles.buttonIcon} />
                  {t('common.delete')}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className={`${styles.result} ${result.success ? styles.resultSuccess : styles.resultError}`}>
          {result.success ? (
            <CheckCircle className={styles.resultIcon} />
          ) : (
            <XCircle className={styles.resultIcon} />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
};
