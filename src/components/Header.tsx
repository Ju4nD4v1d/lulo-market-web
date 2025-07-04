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
      const sections = ['home', 'businesses', 'shoppers', 'pricing', 'about'];
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
          relative text-[#4B371C] group
          transition-all duration-300 ease-out
          hover:text-primary-400
          ${isActive ? 'text-primary-400' : ''}
        `}
      >
        <span className="relative">
          {children}
          <span className={`
            absolute -bottom-1 left-0 w-full h-0.5
            bg-primary-400 origin-left
            transform scale-x-0 transition-transform duration-300 ease-out
            group-hover:scale-x-100
            ${isActive ? 'scale-x-100' : ''}
          `} />
        </span>
        <span className={`
          absolute inset-0 w-full h-full
          bg-primary-400/10 rounded-lg
          transform scale-90 opacity-0 transition-all duration-300
          group-hover:opacity-100 group-hover:scale-110
        `} />
      </a>
    );
  };

  return (
    <header className="fixed w-full z-50">
      <div className="container mx-auto px-4">
        <nav className={`
          fixed top-4 left-1/2 -translate-x-1/2
          bg-white/10 backdrop-blur-md
          border border-white/20
          rounded-full
          shadow-sm
          transition-all duration-300
          ${isScrolled ? 'py-2 bg-white/15' : 'py-3'}
          w-[calc(100%-2rem)]
          max-w-6xl
        `}>
          <div className="px-6 flex justify-between items-center">
            <a href="#" className="flex items-center group">
              <img 
                src="/logo_lulo.png" 
                alt="Lulo"
                className="h-20 w-auto transition-all duration-300 group-hover:scale-105"
              />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink href="#">{t('nav.home')}</NavLink>
              <NavLink href="#businesses">{t('nav.forBusinesses')}</NavLink>
              <NavLink href="#shoppers">{t('nav.forShoppers')}</NavLink>
              <NavLink href="#pricing">{t('nav.prices')}</NavLink>
              <NavLink href="#about">{t('nav.about')}</NavLink>
              <button 
                onClick={toggleLanguage}
                className="group relative text-[#4B371C] transition-all duration-300 hover:text-primary-400"
              >
                <span className="flex items-center space-x-1">
                  <Globe size={16} />
                  <span>{t('language.toggle')}</span>
                </span>
                <span className="absolute inset-0 w-full h-full bg-primary-400/10 rounded-lg transform scale-90 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleLanguage}
                className="mr-4 text-[#4B371C] hover:text-primary-400 transition-all duration-300"
              >
                <Globe size={20} />
              </button>
              <button
                onClick={toggleMenu}
                className="text-[#4B371C] hover:text-primary-400 transition-all duration-300"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`
          md:hidden fixed inset-0 z-40 
          bg-white/10 backdrop-blur-lg
          transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          transition-transform duration-300 ease-in-out pt-24
        `}
      >
        <nav className="flex flex-col items-center space-y-8 p-4">
          {['home', 'businesses', 'shoppers', 'pricing', 'about'].map((section) => (
            <a 
              key={section}
              href={`#${section === 'home' ? '' : section}`}
              className={`
                group relative text-xl text-[#4B371C]
                transition-all duration-300
                hover:text-primary-400
                ${activeSection === section ? 'text-primary-400' : ''}
              `}
              onClick={() => setIsOpen(false)}
            >
              <span className="relative">
                {t(`nav.${section === 'home' ? 'home' : section === 'businesses' ? 'forBusinesses' : section === 'shoppers' ? 'forShoppers' : section === 'pricing' ? 'prices' : 'about'}`)}
                <span className={`
                  absolute -bottom-1 left-0 w-full h-0.5
                  bg-primary-400 origin-left
                  transform scale-x-0 transition-transform duration-300
                  group-hover:scale-x-100
                  ${activeSection === section ? 'scale-x-100' : ''}
                `} />
              </span>
              <span className={`
                absolute inset-0 w-full h-full
                bg-primary-400/10 rounded-lg
                transform scale-90 opacity-0 transition-all duration-300
                group-hover:opacity-100 group-hover:scale-110
              `} />
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};