import React, { useEffect, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';

export const Shoppers = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
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

    const elements = [sectionRef.current, ...stepRefs.current, ...featureRefs.current];
    elements.forEach(element => {
      if (element) observer.observe(element);
    });

    return () => {
      elements.forEach(element => {
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const steps = [
    {
      number: '1',
      title: 'Browse Stores',
      description: 'Discover authentic Latino restaurants and home kitchens in your area',
      illustration: '/illustrations/web-shopping.svg'
    },
    {
      number: '2',
      title: 'Place Order',
      description: 'Choose your favorite dishes and place your order with just a few clicks',
      illustration: '/illustrations/confirmation.svg'
    },
    {
      number: '3',
      title: 'Enjoy Fresh Food',
      description: 'Get your order delivered fresh to your door in 30-45 minutes',
      illustration: '/illustrations/delivery.svg'
    }
  ];

  return (
    <section 
      id="shoppers"
      className="relative py-24 bg-white"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          ref={sectionRef}
          className="text-center mb-16 transform transition-all duration-1000 translate-y-12 opacity-0"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6">
            For <span className="font-bold">Food Lovers</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the taste of home with authentic Latino cuisine delivered fresh
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-16">
            How It Works
          </h3>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={el => stepRefs.current[index] = el}
                className="text-center transform transition-all duration-1000 translate-y-12 opacity-0"
              >
                {/* Illustration */}
                <div className="w-full h-48 mb-8 flex items-center justify-center">
                  <img 
                    src={step.illustration} 
                    alt={step.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Step number */}
                <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center text-black font-bold text-lg mx-auto mb-6">
                  {step.number}
                </div>
                
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h4>
                
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a 
            href="#" 
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-400 text-black font-semibold rounded-xl text-lg transition-all duration-200 hover:bg-primary-500 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Start Shopping
          </a>
        </div>
      </div>
    </section>
  );
};