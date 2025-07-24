import React, { useEffect, useRef } from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    const elements = [sectionRef.current, ...stepRefs.current];
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
      title: 'Browse & Order',
      description: 'Discover authentic dishes from 500+ Latino home cooks and restaurants in your area.',
      illustration: '/illustrations/web-shopping.svg',
      benefit: 'Authentic flavors verified by community'
    },
    {
      number: '2',
      title: 'Fast Preparation',
      description: 'Your order is prepared fresh by experienced cooks using traditional family recipes.',
      illustration: '/illustrations/confirmation.svg',
      benefit: 'Made-to-order freshness guaranteed'
    },
    {
      number: '3',
      title: 'Quick Delivery',
      description: 'Enjoy your meal delivered hot to your door in 30-45 minutes with real-time tracking.',
      illustration: '/illustrations/delivery.svg',
      benefit: 'Hot food, every time'
    }
  ];

  return (
    <section id="how-it-works" className="relative py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          ref={sectionRef}
          className="text-center mb-16 transform transition-all duration-1000 translate-y-12 opacity-0"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            From Kitchen to Your Door in <span className="text-primary-600">3 Simple Steps</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join thousands of customers enjoying authentic Latino cuisine delivered fresh daily
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              ref={el => stepRefs.current[index] = el}
              className="text-center transform transition-all duration-1000 translate-y-12 opacity-0 group"
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Illustration */}
              <div className="w-full h-48 mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={step.illustration} 
                  alt={step.title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Step Number Badge */}
              <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center text-black font-bold text-lg mx-auto mb-4">
                {step.number}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {step.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-4">
                {step.description}
              </p>

              {/* Benefit Badge - Simplified */}
              <div className="bg-primary-100 rounded-full px-4 py-2">
                <span className="text-primary-800 font-medium text-sm">
                  {step.benefit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Row - Simplified */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">30-45min</div>
              <div className="font-semibold text-gray-900">Average Delivery</div>
              <div className="text-sm text-gray-600">Hot and fresh to your door</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">100%</div>
              <div className="font-semibold text-gray-900">Fresh Guarantee</div>
              <div className="text-sm text-gray-600">Made-to-order quality</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <div className="font-semibold text-gray-900">Verified Cooks</div>
              <div className="text-sm text-gray-600">Authentic Latino cuisine</div>
            </div>
          </div>
        </div>

        {/* Dual CTAs */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Primary CTA - Shoppers */}
            <a 
              href="#" 
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-400 text-black font-bold rounded-xl text-lg transition-all duration-200 hover:bg-primary-500 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-primary-400 focus:ring-offset-2"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Start Ordering Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            
            {/* Secondary CTA - Business */}
            <a 
              href="#pricing" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl text-lg border-2 border-gray-300 transition-all duration-200 hover:border-primary-400 hover:text-primary-600 hover:shadow-lg hover:-translate-y-1"
            >
              Join as a Cook
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </div>
          
          <p className="text-sm text-gray-500">
            Free delivery on orders over $25 • No hidden fees • 4.9★ rated service
          </p>
        </div>
      </div>
    </section>
  );
};