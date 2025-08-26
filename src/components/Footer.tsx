import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Globe, Mail, MapPin, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DeliveryAreasModal } from './DeliveryAreasModal';

export const Footer = () => {
  const { toggleLanguage, t } = useLanguage();
  const [showDeliveryMap, setShowDeliveryMap] = useState(false);

  const handleCreateAccountClick = () => {
    window.location.hash = '#login';
  };

  return (
    <>
      <footer className="bg-slate-900/90 text-slate-100 backdrop-blur-md footer-grain">
        {/* Business CTA Section - integrated at top of footer */}
        <div className="py-16 lg:py-20 border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('home.partnerCta.title')}
            </h2>
            <p className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('home.partnerCta.description')}
            </p>
            <button
              onClick={() => window.location.hash = '#business'}
              className="btn-primary focus-ring inline-flex items-center gap-2 text-lg px-8 py-4"
            >
              {t('home.partnerCta.button')}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Brand accent line */}
        <div className="h-1 bg-brand"></div>        
        <div className="container mx-auto px-4 py-16 text-slate-300">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold text-slate-100 mb-6">
                LuloCart
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Connecting communities through authentic Latino cuisine, one meal at a time.
              </p>
              
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-brand transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/40 rounded">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-slate-400 hover:text-brand transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/40 rounded">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-slate-400 hover:text-brand transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/40 rounded">
                  <Instagram size={20} />
                </a>
                <button
                  onClick={toggleLanguage}
                  className="text-slate-400 hover:text-brand transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
                >
                  <Globe size={20} />
                </button>
              </div>
            </div>
          
            {/* Business */}
            <div>
              <h4 className="text-lg font-semibold text-slate-100 mb-4">
                For Business
              </h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={handleCreateAccountClick}
                    className="text-slate-300 hover:text-brand transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
                  >
                    Create Account
                  </button>
                </li>
                <li>
                  <a href="#login" className="text-slate-300 hover:text-brand transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/40 rounded">
                    Seller Dashboard
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-slate-300 hover:text-brand transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/40 rounded">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Shoppers */}
            <div>
              <h4 className="text-lg font-semibold text-slate-100 mb-4">
                For Shoppers
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-300 hover:text-brand transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/40 rounded">
                    Browse Stores
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => setShowDeliveryMap(true)}
                    className="text-slate-300 hover:text-brand transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
                  >
                    Delivery Areas
                  </button>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-brand transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/40 rounded">
                    Help & Support
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold text-slate-100 mb-4">
                Contact
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-4 h-4 text-brand" />
                  <span className="text-sm">support@lulocart.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin className="w-4 h-4 text-brand" />
                  <span className="text-sm">Vancouver, BC Canada</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 mb-4 md:mb-0 text-sm">
              © 2024 LuloCart. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-brand transition-colors text-sm focus-visible:ring-2 focus-visible:ring-brand/40 rounded">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-400 hover:text-brand transition-colors text-sm focus-visible:ring-2 focus-visible:ring-brand/40 rounded">
                Terms of Service
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
