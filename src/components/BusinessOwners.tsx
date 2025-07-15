import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export const BusinessOwners = () => {
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
      title: 'Setup in Minutes',
      description: 'Get your store online with our simple three-step process. No technical knowledge required.',
      illustration: '/illustrations/business-setup.svg'
    },
    {
      title: 'Connect with Customers',
      description: 'Reach customers in your area who are looking for authentic Latino cuisine.',
      illustration: '/illustrations/customer-connection.svg'
    },
    {
      title: 'Grow Your Business',
      description: 'Track orders, manage inventory, and grow your revenue with our business tools.',
      illustration: '/illustrations/business-growth.svg'
    }
  ];

  return (
    <section 
      id="businesses"
      className="relative py-24 bg-gray-50"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          ref={sectionRef}
          className="text-center mb-16 transform transition-all duration-1000 translate-y-12 opacity-0"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6">
            For <span className="font-bold">Business Owners</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join our marketplace and share your authentic flavors with your community
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={el => featureRefs.current[index] = el}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 transform translate-y-12 opacity-0"
            >
              {/* Illustration */}
              <div className="w-full h-48 mb-8 flex items-center justify-center">
                <img 
                  src={feature.illustration} 
                  alt={feature.title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {feature.description}
              </p>
              
              <div className="flex items-center text-primary-600 font-medium">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a 
            href="#pricing" 
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-400 text-black font-semibold rounded-xl text-lg transition-all duration-200 hover:bg-primary-500 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
};