import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Hero = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('translate-y-0', 'opacity-100');
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
    <section
      className="relative flex items-center justify-center min-h-screen"
      id="home"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/coffee_farmer.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Warm gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(200, 228, 0, 0.35), rgba(200, 228, 0, 0.25)), linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0))',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={heroRef}
          className="max-w-4xl mx-auto text-center transform transition-all duration-1000 translate-y-12 opacity-0"
        >
          <span className="inline-block text-sm bg-white/20 text-white px-4 py-1.5 rounded-full backdrop-blur-sm mb-6 font-medium tracking-wide">
            {t('hero.tagline')}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            {t('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow">
            {t('hero.subtitle')}
          </p>

          {/* New CTA Container */}
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl border border-white/10">
            <p className="text-white text-lg mb-6">
              {t('hero.marketplaceText')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="#shopper-dashboard"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#4B371C] text-white font-semibold transition-all duration-300 transform hover:bg-[#5B472C] hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-base"
              >
                {t('hero.shopperCta')}
              </a>
              <a
                href="#businesses"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-transparent text-white font-semibold transition-all duration-300 transform hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-base border-2 border-white"
              >
                {t('hero.businessCta')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};