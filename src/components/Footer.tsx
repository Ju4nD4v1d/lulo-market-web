import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DeliveryAreasModal } from './DeliveryAreasModal';
import styles from './Footer.module.css';

export const Footer = () => {
  const { toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [showDeliveryMap, setShowDeliveryMap] = useState(false);

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
              onClick={() => navigate('/business')}
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
                <a
                  href="https://www.facebook.com/profile.php?id=61581108971685"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://www.instagram.com/lulocart/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          
            {/* Business */}
            <div>
              <h4 className={styles.columnTitle}>
                {t('footer.business')}
              </h4>
              <ul className={styles.columnList}>
                <li>
                  <Link to="/business?portal=true" className={styles.columnLink}>
                    {t('footer.sellerDashboard')}
                  </Link>
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
                  <Link to="/" className={styles.columnLink}>
                    {t('footer.browseStores')}
                  </Link>
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
                  <Link to="/help" className={styles.columnLink}>
                    {t('footer.helpSupport')}
                  </Link>
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
              <Link to="/privacy" className={styles.legalLink}>
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className={styles.legalLink}>
                {t('footer.terms')}
              </Link>
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
