import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const ConversionPricing = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45 });

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

  // Mock countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59 };
        }
        return prev;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const businessFeatures = [
    "Setup your store in under 10 minutes",
    "Reach 2,000+ active local customers",
    "Keep 85% of every sale (industry leading)",
    "Free marketing tools and analytics",
    "24/7 customer support in English & Spanish",
    "No long-term contracts or hidden fees"
  ];

  return (
    <section id="pricing" className="relative py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={sectionRef}
          className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 transform transition-all duration-1000 translate-y-12 opacity-0"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Start Earning from Your <span className="text-primary-600">Kitchen Today</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-6 md:mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Join 500+ successful Latino cooks already earning an average of $2,400/month on LuloCart
          </p>

          {/* Urgency Banner - Simplified */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-4 py-2 sm:px-6 sm:py-3 mb-4 sm:mb-6 md:mb-8 inline-block">
            <span className="font-bold text-xs sm:text-sm md:text-base">
              LIMITED TIME: FREE setup ends in {timeLeft.hours}h {timeLeft.minutes}m
            </span>
          </div>
        </div>

        {/* Single Focused Plan */}
        <div className="max-w-md mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg sm:shadow-xl border-2 border-primary-400 relative overflow-hidden">
            {/* Popular Badge - Simplified */}
            <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-primary-400 text-black px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
              MOST POPULAR CHOICE
            </div>

            {/* Pricing Header */}
            <div className="text-center mb-6 sm:mb-8 pt-3 sm:pt-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                LuloCart Business
              </h3>

              <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>FREE</div>
                <div className="text-base sm:text-lg text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>setup</div>
              </div>

              <div className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Then only <span className="font-bold text-primary-600">15% commission</span> per order
              </div>

              <div className="bg-primary-100 rounded-lg p-2.5 sm:p-3">
                <div className="text-xs sm:text-sm text-primary-800 font-medium">
                  You keep 85% • Industry average: 70%
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6 sm:mb-8">
              <ul className="space-y-3 sm:space-y-4">
                {businessFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5 sm:gap-3">
                    <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-primary-400 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-black font-bold text-[10px] sm:text-xs">✓</span>
                    </div>
                    <span className="text-sm sm:text-base text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Earnings Preview */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="text-center">
                <div className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Average monthly earnings:</div>
                <div className="text-xl sm:text-2xl font-bold text-primary-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>$2,400 CAD</div>
                <div className="text-[10px] sm:text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Based on 500+ active cooks</div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary-400 text-black py-3 sm:py-4 px-5 sm:px-6 rounded-lg sm:rounded-xl hover:bg-primary-500 transition-all duration-200 font-bold text-base sm:text-lg flex items-center justify-center group"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Start Earning Today - FREE
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-xs sm:text-sm text-gray-500 mt-2.5 sm:mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              No upfront costs • Cancel anytime • Support in Spanish
            </p>
          </div>
        </div>

        {/* Success Stories */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Real Success Stories from Our Cook Partners
          </h3>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-primary-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="text-center mb-2 sm:mb-3">
                <span className="text-yellow-400 font-bold text-sm sm:text-base">★★★★★</span>
              </div>
              <p className="text-sm sm:text-base text-gray-700 italic mb-3 sm:mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                "Made $3,200 my first month selling my grandmother's tamales recipe!"
              </p>
              <div className="font-semibold text-sm sm:text-base text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>- Rosa Martinez, Toronto</div>
            </div>

            <div className="bg-primary-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="text-center mb-2 sm:mb-3">
                <span className="text-yellow-400 font-bold text-sm sm:text-base">★★★★★</span>
              </div>
              <p className="text-sm sm:text-base text-gray-700 italic mb-3 sm:mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                "Finally found a platform that appreciates authentic Colombian food. Great community!"
              </p>
              <div className="font-semibold text-sm sm:text-base text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>- Carlos Gutierrez, Vancouver</div>
            </div>

            <div className="bg-primary-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="text-center mb-2 sm:mb-3">
                <span className="text-yellow-400 font-bold text-sm sm:text-base">★★★★★</span>
              </div>
              <p className="text-sm sm:text-base text-gray-700 italic mb-3 sm:mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                "Setup was so easy! Started taking orders the same day I signed up."
              </p>
              <div className="font-semibold text-sm sm:text-base text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>- Maria Santos, Calgary</div>
            </div>
          </div>
        </div>

        {/* Trust Indicators - Simplified */}
        <div className="text-center">
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center">
              <div>
                <div className="font-bold text-sm sm:text-base text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>500+ Active Cooks</div>
                <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Growing community</div>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
              <div>
                <div className="font-bold text-sm sm:text-base text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>10min Setup</div>
                <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Quick and easy</div>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
              <div>
                <div className="font-bold text-sm sm:text-base text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>4.9★ Partner Rating</div>
                <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Highly rated platform</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};export default ConversionPricing;
