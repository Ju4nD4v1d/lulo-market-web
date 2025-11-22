import { useState } from 'react';
import { Facebook, Twitter, Instagram, Globe, Mail, MapPin, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DeliveryAreasModal } from './DeliveryAreasModal';
import styles from './Footer.module.css';

export const Footer = () => {
  const { toggleLanguage, t } = useLanguage();
  const [showDeliveryMap, setShowDeliveryMap] = useState(false);

  const handleCreateAccountClick = () => {
    window.location.hash = '#login';
  };

  return (
    <>
      <footer className={`${styles.footer} ${styles.footerGrain}`}>
        {/* Business CTA Section - integrated at top of footer */}
        <div className={styles.businessCtaSection}>
          <div className={styles.businessCtaContainer}>
            <h2 className={styles.businessCtaTitle}>
              {t('home.partnerCta.title')}
            </h2>
            <p className={styles.businessCtaDescription}>
              {t('home.partnerCta.description')}
            </p>
            <button
              onClick={() => window.location.hash = '#business'}
              className={`btn-primary focus-ring ${styles.businessCtaButton}`}
            >
              {t('home.partnerCta.button')}
              <ChevronRight className={styles.businessCtaIcon} />
            </button>
          </div>
        </div>

        {/* Brand accent line */}
        <div className={styles.brandAccent}></div>        
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Brand */}
            <div className={styles.brandSection}>
              <h3 className={styles.brandTitle}>
                LuloCart
              </h3>
              <p className={styles.brandDescription}>
                {t('footer.tagline')}
              </p>

              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink}>
                  <Facebook size={20} />
                </a>
                <a href="#" className={styles.socialLink}>
                  <Twitter size={20} />
                </a>
                <a href="#" className={styles.socialLink}>
                  <Instagram size={20} />
                </a>
                <button
                  onClick={toggleLanguage}
                  className={styles.socialLink}
                >
                  <Globe size={20} />
                </button>
              </div>
            </div>
          
            {/* Business */}
            <div>
              <h4 className={styles.columnTitle}>
                {t('footer.business')}
              </h4>
              <ul className={styles.columnList}>
                <li>
                  <button
                    onClick={handleCreateAccountClick}
                    className={styles.columnLink}
                  >
                    {t('footer.createAccount')}
                  </button>
                </li>
                <li>
                  <a href="#login" className={styles.columnLink}>
                    {t('footer.sellerDashboard')}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className={styles.columnLink}>
                    {t('footer.pricing')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Shoppers */}
            <div>
              <h4 className={styles.columnTitle}>
                {t('footer.shopper')}
              </h4>
              <ul className={styles.columnList}>
                <li>
                  <a href="#" className={styles.columnLink}>
                    {t('footer.browseStores')}
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setShowDeliveryMap(true)}
                    className={styles.columnLink}
                  >
                    {t('footer.deliveryAreas')}
                  </button>
                </li>
                <li>
                  <a href="#" className={styles.columnLink}>
                    {t('footer.helpSupport')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className={styles.columnTitle}>
                {t('footer.contact')}
              </h4>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <Mail className={styles.contactIcon} />
                  <span className={styles.contactText}>support@lulocart.com</span>
                </div>
                <div className={styles.contactItem}>
                  <MapPin className={styles.contactIcon} />
                  <span className={styles.contactText}>Vancouver, BC Canada</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.bottomSection}>
            <p className={styles.copyright}>
              {t('footer.copyright')}
            </p>
            <div className={styles.legalLinks}>
              <a href="#privacy" className={styles.legalLink}>
                {t('footer.privacy')}
              </a>
              <a href="#terms" className={styles.legalLink}>
                {t('footer.terms')}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Delivery Areas Modal */}
      <DeliveryAreasModal 
        isOpen={showDeliveryMap} 
        onClose={() => setShowDeliveryMap(false)} 
      />
    </>
  );
};
export default Footer;
