import React from 'react';
import { Facebook, Twitter, Instagram, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { COMPANY_NAME } from '../config/company';

export const Footer = () => {
  const { t, toggleLanguage } = useLanguage();

  return (
    <footer className="bg-primary-500 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-white">{COMPANY_NAME}</span>
            </div>
            <p className="text-white/80 mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <button
                onClick={toggleLanguage}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Globe size={20} />
              </button>
            </div>
          </div>
          
          {/* Quick Links 1 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {t('footer.business')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.createAccount')}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.sellerDashboard')}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.sellerResources')}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.successStories')}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Quick Links 2 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {t('footer.shopper')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.downloadApp')}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.browseStores')}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.deliveryAreas')}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.faqs')}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Quick Links 3 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {t('footer.about')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.ourStory')}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.careers')}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.contact')}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  {t('footer.press')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 mb-4 md:mb-0">
            {t('footer.copyright')}
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
              {t('footer.terms')}
            </a>
            <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
              {t('footer.privacy')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};