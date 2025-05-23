import React, { useEffect, useRef } from 'react';
import { Target, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const About = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);

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

    const elements = [sectionRef.current, missionRef.current, communityRef.current];
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
      id="about"
      className="py-20 bg-background"
    >
      <div className="container mx-auto px-4">
        <div 
          ref={sectionRef}
          className="text-center mb-16 transform transition-all duration-700 translate-y-12 opacity-0"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-text mb-4">
            {t('about.title')}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Our Mission */}
          <div 
            ref={missionRef}
            className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8 transform transition-all duration-700 delay-100 translate-y-12 opacity-0"
          >
            <div className="bg-primary-200 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-text mb-4">
              {t('about.mission')}
            </h3>
            <p className="text-text/70 leading-relaxed">
              {t('about.missionText')}
            </p>
          </div>
          
          {/* Community First */}
          <div 
            ref={communityRef}
            className="bg-gradient-to-br from-coral/10 to-coral/20 rounded-xl p-8 transform transition-all duration-700 delay-200 translate-y-12 opacity-0"
          >
            <div className="bg-coral/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-coral" />
            </div>
            <h3 className="text-2xl font-bold text-text mb-4">
              {t('about.community')}
            </h3>
            <p className="text-text/70 leading-relaxed">
              {t('about.communityText')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};