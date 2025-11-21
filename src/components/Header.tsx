import React, { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Header = () => {
  const { t, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

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

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = href.replace('#', '') === activeSection;
    return (
      <a
        href={href}
        className={`
          relative text-gray-900 font-medium
          transition-all duration-200 ease-out
          hover:text-primary-600
          ${isActive ? 'text-primary-600' : ''}
        `}
      >
        <span className="relative">
          {children}
          <span className={`
            absolute -bottom-1 left-0 w-full h-0.5
            bg-primary-400 origin-left
            transform scale-x-0 transition-transform duration-200 ease-out
            hover:scale-x-100
            ${isActive ? 'scale-x-100' : ''}
          `} />
        </span>
      </a>
    );
  };

  return (
    <header className="fixed w-full z-50 top-0">
      <nav className={`
        bg-white/95 backdrop-blur-sm
        border-b border-gray-200/50
        transition-all duration-300
        ${isScrolled ? 'shadow-sm' : ''}
      `}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <a href="#" className="flex items-center">
              <img src="/logo_lulo.png" alt="Lulo" className="h-12 w-auto" />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink href="#">{t('nav.marketplace')}</NavLink>
              <a
                href="#business"
                className="text-gray-900 font-medium transition-all duration-200 ease-out hover:text-primary-400"
              >
                {t('nav.forBusiness')}
              </a>
              <a
                href="#login"
                className="btn-primary inline-flex items-center justify-center text-sm"
              >
                {t('nav.signIn')}
              </a>
              <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Globe size={16} />
                <span className="text-sm">{t('language.toggle')}</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleLanguage}
                className="mr-4 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Globe size={20} />
              </button>
              <button
                onClick={toggleMenu}
                className="text-gray-900 hover:text-primary-600 transition-colors duration-200"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={`
          md:hidden fixed inset-0 z-40 
          bg-white
          transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          transition-transform duration-300 ease-in-out pt-16
        `}
      >
        <nav className="flex flex-col p-4 space-y-6">
          <a 
            href="#"
            className="text-xl text-gray-900 font-medium transition-colors duration-200 hover:text-primary-400"
            onClick={() => setIsOpen(false)}
          >
            {t('nav.marketplace')}
          </a>
          <a 
            href="#business"
            className="text-xl text-gray-900 font-medium transition-colors duration-200 hover:text-primary-400"
            onClick={() => setIsOpen(false)}
          >
            {t('nav.forBusiness')}
          </a>
          <a 
            href="#login"
            className="btn-primary inline-flex items-center justify-center text-lg"
            onClick={() => setIsOpen(false)}
          >
            {t('nav.signIn')}
          </a>
        </nav>
      </div>
    </header>
  );
};
export default Header;
