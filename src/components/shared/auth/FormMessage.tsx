import type * as React from 'react';
/**
 * FormMessage - Reusable error/success message component
 */


import { AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './FormMessage.module.css';

interface FormMessageProps {
  type: 'error' | 'success';
  message: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({ type, message }) => {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className={`${styles.container} ${isError ? styles.error : styles.success}`}>
      {isError ? (
        <AlertCircle className={styles.icon} />
      ) : (
        <CheckCircle2 className={styles.icon} />
      )}
      <p className={styles.message}>{message}</p>
    </div>
  );
};
