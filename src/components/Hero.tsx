import React, { useEffect, useRef } from 'react';
import { ArrowRight, Star } from 'lucide-react';

export const Hero = () => {
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
      className="relative min-h-screen flex items-center justify-center bg-white"
      id="home"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gray-50/30"></div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={heroRef}
          className="max-w-4xl mx-auto text-center transform transition-all duration-1000 translate-y-12 opacity-0"
        >
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-100 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-primary-600 fill-current" />
            <span className="text-primary-800 font-semibold text-sm">
              Canada's #1 Latino Food Marketplace
            </span>
          </div>

          {/* Compelling Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Authentic Latino Food
            <br />
            <span className="text-primary-600">Delivered Fresh</span>
          </h1>

          {/* Value Proposition */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            From abuela's kitchen to your door in 30 minutes. Order from 500+ authentic Latino restaurants and home cooks.
          </p>

          {/* Social Proof Numbers */}
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">500+</div>
              <div className="text-sm text-gray-600">Local Cooks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">10k+</div>
              <div className="text-sm text-gray-600">Orders Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">4.9★</div>
              <div className="text-sm text-gray-600">Customer Rating</div>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="mb-8">
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-400 text-black font-bold rounded-xl text-lg transition-all duration-200 hover:bg-primary-500 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-primary-400 focus:ring-offset-2 mb-4"
            >
              Order Now - FREE Delivery
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <p className="text-sm text-gray-500">
              On orders over $25 • No signup required
            </p>
          </div>

          {/* Trust Signals - Simplified */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <span>2,000+ Happy Customers</span>
            <span>•</span>
            <span>30min Average Delivery</span>
          </div>

          {/* Customer Reviews Preview */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Maria Rodriguez</div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">Verified Customer</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Finally found real empanadas like my grandmother made! The tamales arrived hot and fresh. This is the real deal."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};export default Hero;
