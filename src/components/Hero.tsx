import { useEffect, useRef } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import styles from './Hero.module.css';

export const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.contentVisible);
          }
        });
      },
      { threshold: 0.3 }
    );

    const heroElement = heroRef.current;
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => {
      if (heroElement) {
        observer.unobserve(heroElement);
      }
    };
  }, []);

  return (
    <section className={styles.section} id="home">
      {/* Background Pattern */}
      <div className={styles.background}></div>

      {/* Content */}
      <div className={styles.container}>
        <div ref={heroRef} className={styles.content}>
          {/* Trust Badge */}
          <div className={styles.badge}>
            <Star className={styles.badgeIcon} />
            <span className={styles.badgeText}>
              Canada's #1 Latino Food Marketplace
            </span>
          </div>

          {/* Compelling Headline */}
          <h1 className={styles.title}>
            Authentic Latino Food
            <br />
            <span className={styles.titleHighlight}>Delivered Fresh</span>
          </h1>

          {/* Value Proposition */}
          <p className={styles.subtitle}>
            From abuela's kitchen to your door in 30 minutes. Order from 500+ authentic Latino restaurants and home cooks.
          </p>

          {/* Social Proof Numbers */}
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>Local Cooks</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10k+</div>
              <div className={styles.statLabel}>Orders Delivered</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>4.9★</div>
              <div className={styles.statLabel}>Customer Rating</div>
            </div>
          </div>

          {/* Primary CTA */}
          <div className={styles.ctaSection}>
            <a href="#" className={styles.ctaButton}>
              Order Now - FREE Delivery
              <ArrowRight className={styles.ctaIcon} />
            </a>
            <p className={styles.ctaSubtext}>
              On orders over $25 • No signup required
            </p>
          </div>

          {/* Trust Signals - Simplified */}
          <div className={styles.trustSignals}>
            <span>2,000+ Happy Customers</span>
            <span>•</span>
            <span>30min Average Delivery</span>
          </div>

          {/* Customer Reviews Preview */}
          <div className={styles.reviewSection}>
            <div className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewAvatar}>M</div>
                <div>
                  <div className={styles.reviewAuthor}>Maria Rodriguez</div>
                  <div className={styles.reviewStars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={styles.reviewStar} />
                    ))}
                    <span className={styles.reviewBadge}>Verified Customer</span>
                  </div>
                </div>
              </div>
              <p className={styles.reviewText}>
                "Finally found real empanadas like my grandmother made! The tamales arrived hot and fresh. This is the real deal."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
