import type * as React from 'react';
import { useEffect, useState } from 'react';
import { Sparkles, Rocket, Heart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './WelcomeDialog.module.css';

interface WelcomeDialogProps {
  isOpen: boolean;
  onContinue: () => void;
}

export const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ isOpen, onContinue }) => {
  const { t } = useLanguage();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay content animation for dramatic effect
      setTimeout(() => setShowContent(true), 300);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      {/* Animated background particles */}
      <div className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div key={i} className={styles.particle} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }} />
        ))}
      </div>

      <div className={`${styles.dialog} ${showContent ? styles.visible : ''}`}>
        {/* Top decoration */}
        <div className={styles.topDecoration}>
          <Sparkles className={styles.sparkleIcon} />
        </div>

        {/* Main content */}
        <div className={styles.content}>
          {/* Welcome badge */}
          <div className={styles.badge}>
            <Rocket className={styles.badgeIcon} />
            <span className={styles.badgeText}>{t('welcome.badge')}</span>
          </div>

          {/* Title */}
          <h1 className={styles.title}>
            {t('welcome.title')}
          </h1>

          {/* Logo/Brand highlight */}
          <div className={styles.brandHighlight}>
            <span className={styles.brandName}>LuloCart</span>
            <Heart className={styles.heartIcon} />
          </div>

          {/* Message */}
          <p className={styles.message}>
            {t('welcome.message')}
          </p>

          {/* Features list */}
          <div className={styles.features}>
            {[
              { key: 'feature1', icon: '🛒' },
              { key: 'feature2', icon: '🚀' },
              { key: 'feature3', icon: '🎉' }
            ].map((feature, index) => (
              <div
                key={feature.key}
                className={styles.feature}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <span className={styles.featureIcon}>{feature.icon}</span>
                <span className={styles.featureText}>{t(`welcome.${feature.key}`)}</span>
              </div>
            ))}
          </div>

          {/* Excitement message */}
          <div className={styles.excitement}>
            <Sparkles className={styles.excitementIcon} />
            <p className={styles.excitementText}>
              {t('welcome.excitement')}
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={onContinue}
            className={styles.continueButton}
          >
            <span>{t('welcome.continue')}</span>
            <ArrowRight className={styles.buttonIcon} />
          </button>
        </div>

        {/* Bottom decoration */}
        <div className={styles.bottomDecoration} />
      </div>
    </div>
  );
};
