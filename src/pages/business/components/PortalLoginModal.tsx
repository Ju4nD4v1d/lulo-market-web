import type * as React from 'react';

import { LogIn, Eye, EyeOff } from 'lucide-react';
import styles from './PortalLoginModal.module.css';

interface PortalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  loginData: { email: string; password: string };
  setLoginData: (data: { email: string; password: string }) => void;
  loginError: string;
  isLoggingIn: boolean;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

export const PortalLoginModal: React.FC<PortalLoginModalProps> = ({
  isOpen,
  onClose,
  showPassword,
  setShowPassword,
  loginData,
  setLoginData,
  loginError,
  isLoggingIn,
  onSubmit,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('business.login.title')}</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              {t('business.login.email')}
            </label>
            <input
              id="email"
              type="email"
              required
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className={styles.input}
              placeholder={t('business.login.emailPlaceholder')}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              {t('business.login.password')}
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className={styles.input}
                placeholder={t('business.login.passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
              >
                {showPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
              </button>
            </div>
          </div>

          {loginError && (
            <div className={styles.error}>
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className={styles.submitButton}
          >
            {isLoggingIn ? (
              <div className={styles.spinner} />
            ) : (
              <LogIn className={styles.loginIcon} />
            )}
            {isLoggingIn ? 'Signing In...' : t('business.login.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};
