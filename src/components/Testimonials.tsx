import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type Testimonial = {
  key: string;
  quoteKey: string;
  authorKey: string;
  avatarUrl: string;
};

export const Testimonials = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      key: 'testimonial1',
      quoteKey: 'testimonial1.quote',
      authorKey: 'testimonial1.author',
      avatarUrl: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=120'
    },
    {
      key: 'testimonial2',
      quoteKey: 'testimonial2.quote',
      authorKey: 'testimonial2.author',
      avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=120'
    },
    {
      key: 'testimonial3',
      quoteKey: 'testimonial3.quote',
      authorKey: 'testimonial3.author',
      avatarUrl: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=120'
    }
  ];

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

    const sectionElement = sectionRef.current;
    if (sectionElement) {
      observer.observe(sectionElement);
    }

    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToPrev = () => {
    setActiveIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section 
      id="testimonials"
      className="py-20 bg-gradient-to-br from-primary-500 to-primary-600"
    >
      <div className="container mx-auto px-4">
        <div 
          ref={sectionRef}
          className="transform transition-all duration-700 translate-y-12 opacity-0"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center">
            {t('testimonials.title')}
          </h2>
          
          <div className="max-w-4xl mx-auto relative px-4">
            {/* Testimonial Slider */}
            <div className="overflow-hidden rounded-xl bg-white/10 backdrop-blur-md p-8 md:p-12 shadow-xl">
              <div className="text-primary-400 mb-6">
                <Quote size={40} />
              </div>
              
              <div className="relative h-64">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.key}
                    className={`absolute inset-0 transition-opacity duration-1000 flex flex-col h-full ${
                      index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <p className="text-xl md:text-2xl text-white mb-8 leading-relaxed italic">
                      {t(testimonial.quoteKey)}
                    </p>
                    
                    <div className="mt-auto flex items-center">
                      <img 
                        src={testimonial.avatarUrl} 
                        alt={t(testimonial.authorKey)}
                        className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-primary-400"
                      />
                      <p className="text-white font-medium">
                        {t(testimonial.authorKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation Dots */}
              <div className="flex justify-center space-x-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === activeIndex ? 'bg-primary-400' : 'bg-white/30'
                    } transition-all duration-300`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-2 transition-all transform hover:scale-110"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-2 transition-all transform hover:scale-110"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};