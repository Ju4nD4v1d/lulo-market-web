/**
 * OrphanOrderCleanupTool - Manual cleanup of abandoned checkout orders
 * Allows admins to trigger cleanup of orders that never completed payment
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Wrench,
  Clock
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  triggerOrphanOrderCleanup,
  OrphanOrderCleanupResult,
  OrphanOrderCleanupMetrics
} from '../../../../services/api/adminApi';
import styles from './OrphanOrderCleanupTool.module.css';

export const OrphanOrderCleanupTool = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OrphanOrderCleanupResult | null>(null);

  // Refs to prevent race conditions and memory leaks
  const isMountedRef = useRef(false);
  const cleanupInProgressRef = useRef(false);

  // Set mounted on mount, cleanup on unmount to prevent memory leaks
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Trigger orphan order cleanup with optional grace period skip.
   * Guards against race conditions (multiple simultaneous requests)
   * and memory leaks (state updates after unmount).
   */
  const handleCleanup = useCallback(async (skipGracePeriod: boolean) => {
    // Prevent multiple simultaneous cleanup requests
    if (cleanupInProgressRef.current) {
      console.log('🧹 Cleanup already in progress, skipping');
      return;
    }

    cleanupInProgressRef.current = true;
    setIsLoading(true);
    setResult(null);

    try {
      const response = await triggerOrphanOrderCleanup({ skipGracePeriod });
      console.log('🧹 Component received response:', response, 'isMounted:', isMountedRef.current);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setResult(response);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('🧹 Component caught error:', error);
      if (isMountedRef.current) {
        setResult({
          success: false,
          error: error instanceof Error ? error.message : t('admin.orderCleanup.error'),
        });
        setIsLoading(false);
      }
    } finally {
      cleanupInProgressRef.current = false;
    }
  }, [t]);

  /**
   * Render cleanup metrics in a grid layout.
   * Shows all metrics with appropriate styling based on values.
   */
  const renderMetrics = (metrics: OrphanOrderCleanupMetrics) => {
    const hasActivity = metrics.deleted > 0 || metrics.fixed > 0;
    const hasFailed = metrics.failed > 0;

    return (
      <div className={styles.metricsSection}>
        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <Package className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <span className={styles.metricValue}>{metrics.processed}</span>
              <span className={styles.metricLabel}>{t('admin.orderCleanup.metrics.processed')}</span>
            </div>
          </div>
          <div className={`${styles.metricItem} ${metrics.deleted > 0 ? styles.metricDeleted : ''}`}>
            <Trash2 className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <span className={styles.metricValue}>{metrics.deleted}</span>
              <span className={styles.metricLabel}>{t('admin.orderCleanup.metrics.deleted')}</span>
            </div>
          </div>
          <div className={`${styles.metricItem} ${metrics.fixed > 0 ? styles.metricFixed : ''}`}>
            <Wrench className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <span className={styles.metricValue}>{metrics.fixed}</span>
              <span className={styles.metricLabel}>{t('admin.orderCleanup.metrics.fixed')}</span>
            </div>
          </div>
          {hasFailed && (
            <div className={`${styles.metricItem} ${styles.metricFailed}`}>
              <XCircle className={styles.metricIcon} />
              <div className={styles.metricContent}>
                <span className={styles.metricValue}>{metrics.failed}</span>
                <span className={styles.metricLabel}>{t('admin.orderCleanup.metrics.failed')}</span>
              </div>
            </div>
          )}
        </div>

        {!hasActivity && metrics.processed === 0 && (
          <p className={styles.noOrdersMessage}>{t('admin.orderCleanup.noOrphansFound')}</p>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Trash2 className={styles.headerIcon} />
        <div>
          <h3 className={styles.title}>{t('admin.orderCleanup.title')}</h3>
          <p className={styles.description}>{t('admin.orderCleanup.description')}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          onClick={() => handleCleanup(false)}
          disabled={isLoading}
          className={styles.primaryButton}
        >
          {isLoading ? (
            <>
              <Loader2 className={styles.spinningIcon} />
              {t('admin.orderCleanup.cleaning')}
            </>
          ) : (
            <>
              <Clock className={styles.buttonIcon} />
              {t('admin.orderCleanup.cleanWithGrace')}
            </>
          )}
        </button>

        <button
          onClick={() => handleCleanup(true)}
          disabled={isLoading}
          className={styles.secondaryButton}
        >
          {isLoading ? (
            <>
              <Loader2 className={styles.spinningIcon} />
              {t('admin.orderCleanup.cleaning')}
            </>
          ) : (
            <>
              <AlertTriangle className={styles.buttonIcon} />
              {t('admin.orderCleanup.forceClean')}
            </>
          )}
        </button>
      </div>

      <p className={styles.hint}>{t('admin.orderCleanup.hint')}</p>

      {result && (
        <div className={`${styles.result} ${result.success ? styles.resultSuccess : styles.resultError}`}>
          <div className={styles.resultHeader}>
            {result.success ? (
              <CheckCircle className={styles.resultIcon} />
            ) : (
              <XCircle className={styles.resultIcon} />
            )}
            <span className={styles.resultMessage}>
              {result.success ? result.message : result.error}
            </span>
          </div>

          {result.success && result.metrics && renderMetrics(result.metrics)}

          {result.errors && result.errors.length > 0 && (
            <div className={styles.errorList}>
              <h4 className={styles.errorListTitle}>{t('admin.orderCleanup.errorDetails')}</h4>
              <ul className={styles.errorItems}>
                {result.errors.slice(0, 5).map((err, index) => (
                  <li key={index} className={styles.errorItem}>
                    <code className={styles.errorOrderId}>{err.orderId}</code>
                    <span className={styles.errorText}>{err.error}</span>
                  </li>
                ))}
                {result.errors.length > 5 && (
                  <li className={styles.errorMore}>
                    {t('admin.orderCleanup.moreErrors').replace('{count}', String(result.errors.length - 5))}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
