import React, { useEffect, useRef } from 'react';
import { ShoppingCart, Truck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Shoppers = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('translate-y-0', 'opacity-100');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = [sectionRef.current, ...featureRefs.current, imageRef.current];
    elements.forEach(element => {
      if (element) observer.observe(element);
    });

    return () => {
      elements.forEach(element => {
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  return (
    <section 
      id="shoppers"
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-primary-400/10 transform -skew-x-12" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-coral/10 transform skew-x-12" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div 
          ref={sectionRef}
          className="text-center mb-20 transform transition-all duration-700 translate-y-12 opacity-0"
        >
          <span className="inline-block text-sm bg-primary-400/10 text-primary-600 px-4 py-1.5 rounded-full mb-4 font-medium tracking-wide">
            {t('shoppers.title')}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight">
            {t('shoppers.subtitle')}
          </h2>
          <p className="text-lg md:text-xl text-text/60 max-w-2xl mx-auto leading-relaxed">
            {t('shoppers.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="grid gap-8">
              {/* Feature 1 */}
              <div 
                ref={el => featureRefs.current[0] = el}
                className="bg-white rounded-xl shadow-md p-6 flex items-start transform transition-all duration-700 delay-100 translate-y-12 opacity-0 hover:shadow-lg"
              >
                <div className="bg-primary-100 p-3 rounded-full shrink-0 mr-4">
                  <ShoppingCart className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text mb-2">
                    {t('shoppers.feature1.title')}
                  </h3>
                  <p className="text-text/70">
                    {t('shoppers.feature1.desc')}
                  </p>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div 
                ref={el => featureRefs.current[1] = el}
                className="bg-white rounded-xl shadow-md p-6 flex items-start transform transition-all duration-700 delay-200 translate-y-12 opacity-0 hover:shadow-lg"
              >
                <div className="bg-coral/10 p-3 rounded-full shrink-0 mr-4">
                  <Truck className="w-6 h-6 text-coral" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text mb-2">
                    {t('shoppers.feature2.title')}
                  </h3>
                  <p className="text-text/70">
                    {t('shoppers.feature2.desc')}
                  </p>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div 
                ref={el => featureRefs.current[2] = el}
                className="bg-white rounded-xl shadow-md p-6 flex items-start transform transition-all duration-700 delay-300 translate-y-12 opacity-0 hover:shadow-lg"
              >
                <div className="bg-primary-100 p-3 rounded-full shrink-0 mr-4">
                  <Heart className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text mb-2">
                    {t('shoppers.feature3.title')}
                  </h3>
                  <p className="text-text/70">
                    {t('shoppers.feature3.desc')}
                  </p>
                </div>
              </div>
              
              {/* App Store Buttons */}
              <div 
                className="flex flex-col sm:flex-row gap-4 pt-4 transform transition-all duration-700 delay-400 translate-y-12 opacity-0"
                ref={el => featureRefs.current[3] = el}
              >
                <a 
                  href="#" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-text text-white font-medium transition-all duration-200 transform hover:bg-text/90 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-base"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.09 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                  </svg>
                  <span>{t('shoppers.appStore')}</span>
                </a>
                <a 
                  href="#" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-text text-white font-medium transition-all duration-200 transform hover:bg-text/90 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-base"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" />
                  </svg>
                  <span>{t('shoppers.googlePlay')}</span>
                </a>
              </div>
            </div>
          </div>
          
          {/* Image Section */}
          <div 
            ref={imageRef}
            className="order-1 md:order-2 transform transition-all duration-1000 translate-y-12 opacity-0"
          >
            <img 
              src="/for_shoppers.png" 
              alt="Shoppers using Lulop"
              className="w-full h-auto object-cover transform transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
};