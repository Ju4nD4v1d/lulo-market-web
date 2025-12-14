/**
 * VibrantBackground Component
 *
 * A reusable background wrapper that applies the vibrant abstract background
 * with a semi-transparent dark overlay for readability.
 *
 * Features:
 * - Fixed background image that stays in place while content scrolls
 * - Configurable overlay opacity (25-35% default)
 * - Optional subtle grain texture for depth
 * - Children render on top of the background
 */
import type { FC, ReactNode } from 'react';
import styles from './VibrantBackground.module.css';

interface VibrantBackgroundProps {
  children: ReactNode;
  /** Overlay intensity: 'light' (18%), 'normal' (28%), 'heavy' (42%) */
  overlay?: 'light' | 'normal' | 'heavy';
  /** Whether to show the subtle grain texture */
  showGrain?: boolean;
  /** Additional className for the container */
  className?: string;
}

export const VibrantBackground: FC<VibrantBackgroundProps> = ({
  children,
  overlay = 'normal',
  showGrain = true,
  className = ''
}) => {
  const overlayClass = {
    light: styles.overlayLight,
    normal: styles.overlayNormal,
    heavy: styles.overlayHeavy
  }[overlay];

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {/* Fixed background image */}
      <div className={styles.background} aria-hidden="true" />

      {/* Dark overlay */}
      <div className={`${styles.overlay} ${overlayClass}`} aria-hidden="true" />

      {/* Grain texture */}
      {showGrain && <div className={styles.grain} aria-hidden="true" />}

      {/* Content */}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default VibrantBackground;
