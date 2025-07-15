import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DeliveryAreasModal } from './DeliveryAreasModal';

export const Footer = () => {
  const { toggleLanguage } = useLanguage();
  const [showDeliveryMap, setShowDeliveryMap] = useState(false);

  const handleCreateAccountClick = () => {
    window.location.hash = '#login';
  };

  return (
    <>
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold text-primary-400 mb-6">
                LuloCart
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Connecting communities through authentic Latino cuisine, one meal at a time.
              </p>
              
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                  <Instagram size={20} />
                </a>
                <button
                  onClick={toggleLanguage}
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                >
                  <Globe size={20} />
                </button>
              </div>
            </div>
          
            {/* Business */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                For Business
              </h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={handleCreateAccountClick}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    Create Account
                  </button>
                </li>
                <li>
                  <a href="#login" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    Seller Dashboard
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Shoppers */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                For Shoppers
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    Browse Stores
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => setShowDeliveryMap(true)}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    Delivery Areas
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    Help & Support
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Contact
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-4 h-4 text-primary-400" />
                  <span className="text-sm">hello@lulocart.ca</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-4 h-4 text-primary-400" />
                  <span className="text-sm">+1 (647) 555-LULO</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span className="text-sm">Toronto, ON Canada</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0 text-sm">
              © 2024 LuloCart. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
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