/**
 * AdminLoginPage - Login page for admin access
 * Validates credentials and checks for admin userType
 */

import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAdminLogin } from './hooks/useAdminLogin';
import styles from './AdminLoginPage.module.css';

export const AdminLoginPage = () => {
  const { t } = useLanguage();
  const {
    showPassword,
    setShowPassword,
    loginData,
    handleInputChange,
    loginError,
    isLoggingIn,
    handleAdminLogin
  } = useAdminLogin();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Shield size={48} color="var(--color-primary)" />
          </div>
          <h1 className={styles.title}>{t('admin.login.title')}</h1>
          <p className={styles.subtitle}>{t('admin.login.subtitle')}</p>
        </div>

        <form className={styles.form} onSubmit={(e) => handleAdminLogin(e, t)}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">
              {t('business.login.email')}
            </label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder={t('business.login.emailPlaceholder')}
                value={loginData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">
              {t('business.login.password')}
            </label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder={t('business.login.passwordPlaceholder')}
                value={loginData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className={styles.passwordIcon} />
                ) : (
                  <Eye className={styles.passwordIcon} />
                )}
              </button>
            </div>
          </div>

          {loginError && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className={`${styles.buttonIcon} ${styles.spinning}`} />
                {t('admin.login.signingIn')}
              </>
            ) : (
              <>
                <Shield className={styles.buttonIcon} />
                {t('admin.login.button')}
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            {t('business.login.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
