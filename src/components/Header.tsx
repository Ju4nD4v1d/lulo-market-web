import type * as React from 'react';
import { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserButton } from './UserButton';
import { UserMenuDropdown } from './shared/user/UserMenuDropdown';
import styles from './Header.module.css';

export const Header = () => {
  const { t, toggleLanguage, locale } = useLanguage();
  const { currentUser, userProfile, logout, setRedirectAfterLogin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Update active section based on scroll position
      const sections = ['home', 'how-it-works', 'social-proof', 'pricing'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleSignInClick = () => {
    setRedirectAfterLogin(window.location.hash || '#');
    window.location.hash = '#login';
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      window.location.hash = '#';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleMenuNavigation = (path: string) => {
    setShowUserMenu(false);
    window.location.hash = path;
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = href.replace('#', '') === activeSection;
    return (
      <a
        href={href}
        className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
      >
        <span className={styles.navLinkInner}>
          {children}
          <span className={styles.navLinkUnderline} />
        </span>
      </a>
    );
  };

  return (
    <header className={styles.header}>
      <nav className={`${styles.nav} ${isScrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navContainer}>
          <div className={styles.navInner}>
            <a href="#" className={styles.logoLink}>
              <img src="/logo_lulo.png" alt="Lulo" className={styles.logo} />
            </a>

            {/* Desktop Navigation */}
            <div className={styles.desktopNav}>
              <NavLink href="#">{t('nav.marketplace')}</NavLink>
              <a href="#business" className={styles.businessLink}>
                {t('nav.forBusiness')}
              </a>
              <button onClick={toggleLanguage} className={styles.languageButton}>
                <Globe size={16} />
                <span className={styles.languageButtonText}>{t('language.toggle')}</span>
              </button>

              {/* User Button */}
              <div className={styles.userButtonWrapper}>
                <UserButton
                  currentUser={currentUser}
                  userProfile={userProfile}
                  onClick={currentUser ? handleUserMenuClick : handleSignInClick}
                  size="medium"
                  showBorder={true}
                />

                {/* User Menu Dropdown */}
                {currentUser && (
                  <UserMenuDropdown
                    isOpen={showUserMenu}
                    onClose={() => setShowUserMenu(false)}
                    userProfile={userProfile}
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onNavigate={handleMenuNavigation}
                    t={t}
                  />
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className={styles.mobileNav}>
              <button onClick={toggleLanguage} className={styles.mobileLanguageButton}>
                <Globe size={16} />
                <span className={styles.mobileLanguageButtonText}>
                  {locale === 'es' ? 'ES' : 'EN'}
                </span>
              </button>

              {/* Mobile User Button */}
              <UserButton
                currentUser={currentUser}
                userProfile={userProfile}
                onClick={currentUser ? handleUserMenuClick : handleSignInClick}
                size="small"
                showBorder={true}
              />

              <button onClick={toggleMenu} className={styles.mobileMenuButton}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenuOverlay} ${isOpen ? styles.mobileMenuOverlayOpen : ''}`}>
        <nav className={styles.mobileMenuNav}>
          <a
            href="#"
            className={styles.mobileMenuLink}
            onClick={() => setIsOpen(false)}
          >
            {t('nav.marketplace')}
          </a>
          <a
            href="#business"
            className={styles.mobileMenuLink}
            onClick={() => setIsOpen(false)}
          >
            {t('nav.forBusiness')}
          </a>

          {currentUser ? (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleMenuNavigation('#profile/edit');
                }}
                className={styles.mobileMenuButton}
              >
                {t('profile.editProfile')}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleMenuNavigation('#order-history');
                }}
                className={styles.mobileMenuButton}
              >
                {t('orderHistory.title') || 'My Orders'}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className={`${styles.mobileMenuButton} ${styles.mobileMenuButtonDanger}`}
              >
                Sign Out
              </button>
            </>
          ) : (
            <a
              href="#login"
              className={`btn-primary ${styles.mobileMenuSignIn}`}
              onClick={() => setIsOpen(false)}
            >
              {t('nav.signIn')}
            </a>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
