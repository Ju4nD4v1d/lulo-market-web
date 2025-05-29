import React, { useEffect, useRef } from 'react';
import { Target, Users, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const About = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

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

    const elements = [sectionRef.current, ...cardsRef.current];
    elements.forEach(element => {
      if (element) observer.observe(element);
    });

    return () => {
      elements.forEach(element => {
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const cards = [
    {
      icon: Target,
      title: t('about.mission'),
      description: t('about.missionText'),
      color: 'bg-primary-400',
      delay: 'delay-100',
      image: 'https://images.pexels.com/photos/7363068/pexels-photo-7363068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      icon: Users,
      title: t('about.community'),
      description: t('about.communityText'),
      color: 'bg-coral',
      delay: 'delay-200',
      image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      icon: Heart,
      title: 'Our Values',
      description: 'We believe in authenticity, community support, and preserving cultural heritage through every business we empower.',
      color: 'bg-primary-600',
      delay: 'delay-300',
      image: 'https://images.pexels.com/photos/8967083/pexels-photo-8967083.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  return (
    <section 
      id="about"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-primary-400/10 transform -skew-x-12" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-coral/10 transform skew-x-12" />
      </div>

      <div className="container mx-auto px-4">
        <div 
          ref={sectionRef}
          className="text-center mb-16 transform transition-all duration-700 translate-y-12 opacity-0"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-6">
            {t('about.title')}
          </h2>
          <p className="text-lg text-text/60 max-w-3xl mx-auto">
            Discover the story behind our mission to connect Latin American businesses with consumers across North America.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={card.title}
              ref={el => cardsRef.current[index] = el}
              className={`
                relative overflow-hidden rounded-2xl
                transform transition-all duration-700 ${card.delay} translate-y-12 opacity-0
                group
              `}
              style={{ minHeight: '500px' }}
            >
              {/* Background Image with Overlay */}
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center transform transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${card.image})` }}
              >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-700 group-hover:opacity-60" />
              </div>
              
              {/* Content */}
              <div className="relative h-full p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                <div className={`
                  ${card.color} w-16 h-16 rounded-xl
                  flex items-center justify-center text-white
                  mb-6 transform transition-transform duration-300 group-hover:scale-110
                  shadow-lg
                `}>
                  <card.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {card.title}
                </h3>
                <p className="text-white/90 leading-relaxed">
                  {card.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-coral to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};