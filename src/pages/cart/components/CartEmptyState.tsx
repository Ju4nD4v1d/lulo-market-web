import type * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { CartHeader } from './CartHeader';
import { VibrantBackground } from '../../../components/VibrantBackground/VibrantBackground';
import styles from './CartEmptyState.module.css';
import buttonStyles from '../../../styles/button.module.css';

export const CartEmptyState: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <VibrantBackground>
      <div className={styles.container}>
        <CartHeader itemCount={0} />

        <main className={styles.content}>
          {/* Illustration */}
          <div className={styles.illustrationWrapper}>
            <img
              src="/illustrations/undraw_empty.svg"
              alt="Empty cart"
              className={styles.illustration}
            />
          </div>

          {/* Text */}
          <h1 className={styles.title}>
            {t('cart.empty.luloCartEmpty')}
          </h1>
          <p className={styles.subtitle}>
            {t('cart.empty.discoverProducts')}
          </p>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              onClick={handleContinueShopping}
              className={`${buttonStyles.button} ${buttonStyles.primary}`}
            >
              {t('cart.empty.continueShopping')}
            </button>

            {!currentUser && (
              <button
                onClick={handleLogin}
                className={`${buttonStyles.button} ${buttonStyles.ghost} ${styles.ghostButton}`}
              >
                {t('cart.empty.loginRegister')}
              </button>
            )}
          </div>
        </main>
      </div>
    </VibrantBackground>
  );
};
