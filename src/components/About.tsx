import React, { useEffect, useRef } from 'react';
import { Users, Star, Handshake } from 'lucide-react';

export const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      id="about"
      className="relative py-24 bg-white"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          ref={sectionRef}
          className="text-center mb-16 transform transition-all duration-1000 translate-y-12 opacity-0"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6">
            Our <span className="font-bold">Story</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connecting communities through authentic Latino cuisine, one meal at a time
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Family First</h3>
            <p className="text-gray-600 leading-relaxed">
              Every recipe tells a story passed down through generations of loving families.
            </p>
          </div>
          
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Authentic Flavors</h3>
            <p className="text-gray-600 leading-relaxed">
              Traditional recipes prepared with love using time-honored techniques and ingredients.
            </p>
          </div>
          
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Handshake className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Community</h3>
            <p className="text-gray-600 leading-relaxed">
              Building bridges between cultures through the universal language of food.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
            Our Mission
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            We believe food is more than sustenance—it's culture, memory, and connection. 
            LuloCart exists to preserve and share the rich culinary traditions of Latino communities 
            while supporting local businesses and home cooks.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-sm text-gray-600">Happy Families</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">Traditional Recipes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">15</div>
              <div className="text-sm text-gray-600">Countries Represented</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};