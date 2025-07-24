import React, { useEffect, useRef } from 'react';
import { Quote } from 'lucide-react';

export const SocialProof = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const testimonialRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    const elements = [sectionRef.current, ...testimonialRefs.current];
    elements.forEach(element => {
      if (element) observer.observe(element);
    });

    return () => {
      elements.forEach(element => {
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const testimonials = [
    {
      name: "Carlos Mendoza",
      location: "Toronto, ON",
      rating: 5,
      text: "The tamales taste exactly like my grandmother's! Finally found authentic Latino food in Toronto. The delivery was super fast too.",
      initial: "C",
      verified: true
    },
    {
      name: "Isabella Santos",
      location: "Vancouver, BC",
      rating: 5,
      text: "As a business owner on LuloCart, I've connected with so many customers who appreciate real Colombian arepas. My sales have tripled!",
      initial: "I",
      verified: true,
      isBusiness: true
    },
    {
      name: "Miguel Rodriguez",
      location: "Calgary, AB",
      rating: 5,
      text: "Ordered empanadas for my family gathering. Everyone was amazed by the authentic taste. The cook even included a handwritten note!",
      initial: "M",
      verified: true
    }
  ];

  const stats = [
    { number: "10,000+", label: "Orders Delivered", description: "Successfully completed with 99.8% satisfaction" },
    { number: "500+", label: "Verified Cooks", description: "Authentic Latino home cooks and restaurants" },
    { number: "4.9/5", label: "Customer Rating", description: "Average rating from verified purchases" },
    { number: "30min", label: "Avg Delivery", description: "From kitchen to your door across Canada" }
  ];

  return (
    <section id="social-proof" className="relative py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          ref={sectionRef}
          className="text-center mb-16 transform transition-all duration-1000 translate-y-12 opacity-0"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Loved by <span className="text-primary-600">Thousands</span> Across Canada
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join the growing community enjoying authentic Latino cuisine delivered fresh to their door
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="text-3xl font-bold text-primary-600 mb-2">{stat.number}</div>
              <div className="font-semibold text-gray-900 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-600">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={el => testimonialRefs.current[index] = el}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform translate-y-12 opacity-0"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-primary-400 mb-4" />
              
              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>
              
              {/* Rating - Simplified */}
              <div className="mb-4">
                <span className="text-yellow-400 font-bold">★★★★★</span>
                <span className="text-sm text-gray-600 ml-2">5/5</span>
              </div>
              
              {/* Customer Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.initial}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    {testimonial.name}
                    {testimonial.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        ✓ Verified
                      </span>
                    )}
                    {testimonial.isBusiness && (
                      <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">
                        Cook Partner
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges - Simplified */}
        <div className="text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
              <div>
                <div className="font-bold text-gray-900">Health & Safety Certified</div>
                <div className="text-sm text-gray-600">All cooks verified</div>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
              <div>
                <div className="font-bold text-gray-900">Secure Payments</div>
                <div className="text-sm text-gray-600">Your data protected</div>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
              <div>
                <div className="font-bold text-gray-900">Canadian Business</div>
                <div className="text-sm text-gray-600">Proudly Canadian</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};