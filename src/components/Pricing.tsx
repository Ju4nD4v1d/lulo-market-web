import React, { useState, useEffect, useRef } from 'react';
import { Check, ArrowRight, Shield, Zap, MapPin } from 'lucide-react';
import { ContactForm } from './ContactForm';

export const Pricing = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [cardsVisible, setCardsVisible] = useState([false, false]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('translate-y-0', 'opacity-100');
            entry.target.classList.remove('translate-y-12', 'opacity-0');
            
            // Update cards visibility state
            const cardIndex = cardsRef.current.indexOf(entry.target as HTMLDivElement);
            if (cardIndex !== -1) {
              setCardsVisible(prev => {
                const newState = [...prev];
                newState[cardIndex] = true;
                return newState;
              });
            }
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

  const handlePlanClick = () => {
    setShowContactForm(true);
  };

  if (showContactForm) {
    return <ContactForm onBack={() => setShowContactForm(false)} />;
  }

  const basicFeatures = [
    'Store listing in marketplace',
    'Basic order management',
    'Customer messaging',
    'Payment processing',
    'Mobile-friendly dashboard'
  ];

  const premiumFeatures = [
    'All Basic features included',
    'Advanced analytics dashboard',
    'Priority customer support',
    'Custom store branding',
    'Inventory management tools',
    'Marketing campaign tools',
    'Multi-location support'
  ];

  return (
    <section id="pricing" className="relative py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          ref={sectionRef}
          className="text-center mb-16 transform transition-all duration-1000 translate-y-12 opacity-0"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6">
            Simple <span className="font-bold">Pricing</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose the plan that works best for your business
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8 space-x-6">
            <span className={`text-lg font-medium transition-all duration-300 ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ${
                isYearly ? 'bg-primary-400' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isYearly}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out ${
                  isYearly ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-lg font-medium transition-all duration-300 ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-2 inline-flex items-center rounded-full bg-primary-400 px-3 py-1 text-sm font-bold text-black">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Basic Plan */}
          <div 
            ref={el => cardsRef.current[0] = el}
            className={`
              bg-white rounded-xl p-8 shadow-sm border border-gray-200
              transform transition-all duration-700 delay-100
              hover:shadow-md hover:-translate-y-1
              ${!cardsVisible[0] ? 'translate-y-12 opacity-0' : 'translate-y-0 opacity-100'}
            `}
          >
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Basic
              </h3>
              
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${isYearly ? '39' : '49'}
                </span>
                <span className="text-gray-500 ml-2">
                  /{isYearly ? 'month' : 'month'}
                </span>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                Perfect for small restaurants and home kitchens just getting started
              </p>
            </div>

            <div className="mb-8">
              <ul className="space-y-4">
                {basicFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <div className="flex-shrink-0 w-5 h-5 bg-primary-400 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handlePlanClick}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold"
            >
              Get Started
            </button>
          </div>

          {/* Premium Plan */}
          <div 
            ref={el => cardsRef.current[1] = el}
            className={`
              bg-white rounded-xl p-8 shadow-sm border-2 border-primary-400
              transform transition-all duration-700 delay-200
              hover:shadow-md hover:-translate-y-1 relative
              ${!cardsVisible[1] ? 'translate-y-12 opacity-0' : 'translate-y-0 opacity-100'}
            `}
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Premium
              </h3>
              
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${isYearly ? '79' : '99'}
                </span>
                <span className="text-gray-500 ml-2">
                  /{isYearly ? 'month' : 'month'}
                </span>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                For growing businesses that want advanced features and priority support
              </p>
            </div>

            <div className="mb-8">
              <ul className="space-y-4">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <div className="flex-shrink-0 w-5 h-5 bg-primary-400 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handlePlanClick}
              className="w-full bg-primary-400 text-black py-3 px-6 rounded-xl hover:bg-primary-500 transition-all duration-200 font-semibold flex items-center justify-center"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-5 h-5 text-primary-600" />
              <span className="font-medium">Secure & Safe</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Zap className="w-5 h-5 text-primary-600" />
              <span className="font-medium">Instant Setup</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5 text-primary-600" />
              <span className="font-medium">Canadian Business</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            Have questions? We're here to help.
          </p>
          <p className="text-gray-500">
            Contact us at <span className="font-medium text-gray-900">hello@lulocart.ca</span>
          </p>
        </div>
      </div>
    </section>
  );
};