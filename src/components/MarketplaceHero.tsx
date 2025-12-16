import { useState, useEffect, useMemo, type FC } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Clock, Star, Users, Truck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SearchBar } from './SearchBar';
import styles from './MarketplaceHero.module.css';

interface MarketplaceHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const MarketplaceHero: FC<MarketplaceHeroProps> = ({
  searchQuery,
  setSearchQuery
}) => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Carousel slides with dynamic content - memoized to prevent recreation on every render
  const heroSlides = useMemo(() => [
    {
      title: t('hero.slides.taste.title'),
      subtitle: t('hero.slides.taste.subtitle'),
      icon: <Heart className={styles.badgeIcon} style={{ width: 18, height: 18 }} />,
      iconColor: '#ea580c',
      stats: [
        { icon: <Star className={styles.statIcon} />, text: t('hero.stats.authentic'), color: '#ea580c' },
        { icon: <Users className={styles.statIcon} />, text: t('hero.stats.families'), color: '#dc2626' }
      ]
    },
    {
      title: t('hero.slides.community.title'),
      subtitle: t('hero.slides.community.subtitle'),
      icon: <Users className={styles.badgeIcon} style={{ width: 18, height: 18 }} />,
      iconColor: '#2563eb',
      stats: [
        { icon: <MapPin className={styles.statIcon} />, text: t('hero.stats.local'), color: '#2563eb' },
        { icon: <Heart className={styles.statIcon} />, text: t('hero.stats.community'), color: '#4f46e5' }
      ]
    },
    {
      title: t('hero.slides.delivery.title'),
      subtitle: t('hero.slides.delivery.subtitle'),
      icon: <Truck className={styles.badgeIcon} style={{ width: 18, height: 18 }} />,
      iconColor: '#059669',
      stats: [
        { icon: <Clock className={styles.statIcon} />, text: t('hero.stats.fast'), color: '#059669' },
        { icon: <Sparkles className={styles.statIcon} />, text: t('hero.stats.fresh'), color: '#0d9488' }
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
    <div className={styles.heroWrapper}>
      <section className={styles.hero}>
        {/* Glass card container */}
        <div className={styles.heroCard}>
          <div className={styles.heroContent}>
            {/* Text section */}
            <div className={styles.textSection}>
              {/* Badge */}
              <div className={styles.badge}>
                <span style={{ color: currentSlideData.iconColor }}>{currentSlideData.icon}</span>
                <span className={styles.badgeText}>{t('hero.badge')}</span>
              </div>

              {/* Title */}
              <h1 className={styles.title}>{currentSlideData.title}</h1>

              {/* Subtitle */}
              <p className={styles.subtitle}>{currentSlideData.subtitle}</p>

              {/* Stats */}
              <div className={styles.stats}>
                {currentSlideData.stats.map((stat, index) => (
                  <div key={index} className={styles.stat}>
                    <span style={{ color: stat.color }}>{stat.icon}</span>
                    <span className={styles.statText}>{stat.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search section */}
            <div className={styles.searchSection}>
              {/* Search stats */}
              <div className={styles.searchStats}>
                <div className={styles.searchStat}>
                  <Users className={styles.searchStatIcon} style={{ color: '#3b82f6' }} />
                  <span className={styles.searchStatText}>{t('hero.search.stores')}</span>
                </div>
                <div className={styles.searchStat}>
                  <Star className={styles.searchStatIcon} style={{ color: '#f97316' }} />
                  <span className={styles.searchStatText}>{t('hero.search.products')}</span>
                </div>
              </div>

              {/* Search bar */}
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>

          {/* Carousel controls */}
          <div className={styles.carouselControls}>
            <button
              onClick={prevSlide}
              className={styles.carouselButton}
              aria-label="Previous slide"
            >
              <ChevronLeft className={styles.carouselButtonIcon} />
            </button>

            <div className={styles.carouselDots}>
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`${styles.carouselDot} ${
                    index === currentSlide ? styles.carouselDotActive : styles.carouselDotInactive
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className={styles.carouselButton}
              aria-label="Next slide"
            >
              <ChevronRight className={styles.carouselButtonIcon} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};