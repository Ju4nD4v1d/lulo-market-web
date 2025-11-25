import { useState, useEffect, useMemo, type FC } from 'react';
import { Search, Navigation, ChevronLeft, ChevronRight, Sparkles, MapPin, Clock, Star, Users, Truck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MarketplaceHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLocationRequest: () => void;
  locationStatus: 'idle' | 'requesting' | 'granted' | 'denied';
  locationName: string;
}

export const MarketplaceHero: FC<MarketplaceHeroProps> = ({
  searchQuery,
  setSearchQuery,
  onLocationRequest,
  locationStatus,
  locationName
}) => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Carousel slides with dynamic content - memoized to prevent recreation on every render
  const heroSlides = useMemo(() => [
    {
      title: t('hero.slides.taste.title'),
      subtitle: t('hero.slides.taste.subtitle'),
      background: 'bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-red-50/30',
      icon: <Heart className="w-5 h-5 text-orange-600" />,
      accent: 'from-orange-500 to-red-500',
      stats: [
        { icon: <Star className="w-4 h-4" />, text: t('hero.stats.authentic'), color: 'text-orange-600' },
        { icon: <Users className="w-4 h-4" />, text: t('hero.stats.families'), color: 'text-red-600' }
      ]
    },
    {
      title: t('hero.slides.community.title'),
      subtitle: t('hero.slides.community.subtitle'),
      background: 'bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/30',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      accent: 'from-blue-500 to-indigo-600',
      stats: [
        { icon: <MapPin className="w-4 h-4" />, text: t('hero.stats.local'), color: 'text-blue-600' },
        { icon: <Heart className="w-4 h-4" />, text: t('hero.stats.community'), color: 'text-indigo-600' }
      ]
    },
    {
      title: t('hero.slides.delivery.title'),
      subtitle: t('hero.slides.delivery.subtitle'),
      background: 'bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/30',
      icon: <Truck className="w-5 h-5 text-emerald-600" />,
      accent: 'from-emerald-500 to-teal-600',
      stats: [
        { icon: <Clock className="w-4 h-4" />, text: t('hero.stats.fast'), color: 'text-emerald-600' },
        { icon: <Sparkles className="w-4 h-4" />, text: t('hero.stats.fresh'), color: 'text-teal-600' }
      ]
    }
  ], [t]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <section className={`hero-background relative overflow-hidden transition-all duration-700 ${currentSlideData.background} py-4 sm:py-6 lg:py-10`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Compact Hero Banner */}
        <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6 lg:gap-12 mb-4 sm:mb-6 lg:mb-8">
          {/* Carousel Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              {currentSlideData.icon}
              <span className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                {t('hero.badge')}
              </span>
            </div>

            <h1 className="text-h1 text-gray-900 mb-2 sm:mb-3 lg:mb-4 leading-tight transition-all duration-500">
              {currentSlideData.title}
            </h1>

            <p className="body-font text-lg sm:text-xl lg:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-3 sm:mb-4 lg:mb-6 transition-all duration-500">
              {currentSlideData.subtitle}
            </p>

            {/* Stats/Features */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 justify-center lg:justify-start mb-3 sm:mb-4 lg:mb-6">
              {currentSlideData.stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-500">
                  <span className={stat.color}>{stat.icon}</span>
                  <span className="text-gray-700">{stat.text}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center lg:justify-start">
              <button
                onClick={onLocationRequest}
                disabled={locationStatus === 'requesting'}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  locationStatus === 'granted'
                    ? 'bg-blue-500 text-white shadow-sm hover:shadow-md'
                    : locationStatus === 'denied'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-white/70 backdrop-blur-sm border border-gray-300/50 text-gray-600 hover:border-blue-400 hover:bg-white/90'
                }`}
              >
                {locationStatus === 'requesting' ? (
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 border-2 border-current border-t-transparent"></div>
                ) : (
                  <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
                <span className="whitespace-nowrap">
                  {locationStatus === 'granted'
                    ? locationName || t('home.location.set')
                    : locationStatus === 'denied'
                    ? t('home.location.denied')
                    : t('home.location.getLocation')
                  }
                </span>
              </button>
            </div>
          </div>

          {/* Enhanced Search Section */}
          <div className="w-full lg:w-[480px]">
            {/* Search Stats */}
            <div className="flex items-center justify-center lg:justify-end gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-5 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-1.5 bg-white/80 backdrop-blur-sm px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full shadow-sm">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                <span className="font-medium text-gray-700">{t('hero.search.stores')}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 bg-white/80 backdrop-blur-sm px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full shadow-sm">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                <span className="font-medium text-gray-700">{t('hero.search.products')}</span>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-primary-500 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative">
                <div className="absolute left-3 sm:left-4 lg:left-5 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-primary-600 transition-colors">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="text"
                  placeholder={t('home.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 sm:h-12 lg:h-14 pl-10 sm:pl-12 lg:pl-14 pr-3 sm:pr-4 lg:pr-5 bg-white rounded-xl sm:rounded-2xl text-sm sm:text-base lg:text-lg
                           shadow-lg hover:shadow-xl focus:shadow-2xl transition-all duration-300
                           border-2 border-transparent focus:border-primary-400/30 focus:outline-none
                           placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4">
          <button
            onClick={prevSlide}
            className="carousel-arrow focus-ring p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-600 hover:bg-white hover:shadow-md"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Slide Indicators */}
          <div className="flex gap-1.5 sm:gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index);
                  setIsAutoPlaying(false);
                }}
                className={`carousel-dot ${
                  index === currentSlide
                    ? `carousel-dot-active bg-gradient-to-r ${currentSlideData.accent}`
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="carousel-arrow focus-ring p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-600 hover:bg-white hover:shadow-md"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};