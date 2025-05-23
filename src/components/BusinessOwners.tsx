import React, { useEffect, useRef } from 'react';
import { Store, MapPin, Truck, ArrowRight, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const BusinessOwners = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    const elements = [sectionRef.current, ...featureRefs.current];
    elements.forEach(element => {
      if (element) observer.observe(element);
    });

    return () => {
      elements.forEach(element => {
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const features = [
    {
      icon: <Store className="w-8 h-8" />,
      title: 'Quick Setup',
      description: t('business.benefits.setup'),
      color: 'bg-primary-400',
      delay: 'delay-100',
      bgImage: '/quick_setup.png'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Reach Customers',
      description: t('business.benefits.discover'),
      color: 'bg-coral',
      delay: 'delay-200',
      bgImage: '/reach_customers.png'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Grow Sales',
      description: t('business.benefits.delivery'),
      color: 'bg-primary-600',
      delay: 'delay-300',
      bgImage: '/groth.png'
    }
  ];

  return (
    <section 
      id="businesses"
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
            {t('business.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight">
            {t('business.title')}
          </h2>
          <p className="text-lg md:text-xl text-text/60 max-w-2xl mx-auto leading-relaxed">
            {t('business.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={el => featureRefs.current[index] = el}
              className={`
                relative overflow-hidden rounded-2xl
                transform transition-all duration-700 ${feature.delay} translate-y-12 opacity-0
                hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                group
              `}
              style={{
                minHeight: '400px'
              }}
            >
              {/* Background Image with Overlay */}
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center transform transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${feature.bgImage})`,
                }}
              >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-700 group-hover:opacity-60" />
              </div>
              
              {/* Content */}
              <div className="relative h-full p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                <div className={`
                  ${feature.color} w-16 h-16 rounded-xl
                  flex items-center justify-center text-white
                  mb-6 transform transition-transform duration-300 group-hover:scale-110
                  shadow-lg
                `}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/90 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-white hover:text-primary-400 font-medium transition-colors"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center transform transition-all duration-700 delay-400 translate-y-12 opacity-0">
          <a 
            href="#" 
            className="
              inline-flex items-center justify-center
              px-8 py-4 rounded-xl
              bg-primary-400 text-white font-semibold
              transition-all duration-200 transform
              hover:bg-primary-500 hover:scale-[1.02] hover:shadow-lg
              active:scale-[0.98] text-lg
            "
          >
            {t('business.cta')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
};