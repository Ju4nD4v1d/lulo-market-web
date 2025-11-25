import { useEffect, useRef } from 'react';
import { Quote } from 'lucide-react';
import styles from './SocialProof.module.css';

export const SocialProof = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const testimonialRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (entry.target === sectionRef.current) {
              entry.target.classList.add(styles.headerVisible);
            } else {
              entry.target.classList.add(styles.testimonialCardVisible);
            }
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
    <section id="social-proof" className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div
          ref={sectionRef}
          className={styles.header}
        >
          <h2 className={styles.title}>
            Loved by <span className={styles.titleHighlight}>Thousands</span> Across Canada
          </h2>

          <p className={styles.subtitle}>
            Join the growing community enjoying authentic Latino cuisine delivered fresh to their door
          </p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={styles.statCard}
            >
              <div className={styles.statNumber}>{stat.number}</div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statDescription}>{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={el => testimonialRefs.current[index] = el}
              className={styles.testimonialCard}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Quote Icon */}
              <Quote className={styles.quoteIcon} />

              {/* Review Text */}
              <p className={styles.reviewText}>
                "{testimonial.text}"
              </p>

              {/* Rating - Simplified */}
              <div className={styles.rating}>
                <span className={styles.stars}>★★★★★</span>
                <span className={styles.ratingText}>5/5</span>
              </div>

              {/* Customer Info */}
              <div className={styles.customerInfo}>
                <div className={styles.avatar}>
                  {testimonial.initial}
                </div>
                <div className={styles.customerDetails}>
                  <div className={styles.customerName}>
                    {testimonial.name}
                    {testimonial.verified && (
                      <span className={styles.verifiedBadge}>
                        ✓ Verified
                      </span>
                    )}
                    {testimonial.isBusiness && (
                      <span className={styles.businessBadge}>
                        Cook Partner
                      </span>
                    )}
                  </div>
                  <div className={styles.customerLocation}>
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges - Simplified */}
        <div className={styles.trustSection}>
          <div className={styles.trustCard}>
            <div className={styles.trustContent}>
              <div className={styles.trustItem}>
                <div className={styles.trustTitle}>Health & Safety Certified</div>
                <div className={styles.trustDescription}>All cooks verified</div>
              </div>
              <div className={styles.trustDivider}></div>
              <div className={styles.trustItem}>
                <div className={styles.trustTitle}>Secure Payments</div>
                <div className={styles.trustDescription}>Your data protected</div>
              </div>
              <div className={styles.trustDivider}></div>
              <div className={styles.trustItem}>
                <div className={styles.trustTitle}>Canadian Business</div>
                <div className={styles.trustDescription}>Proudly Canadian</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};export default SocialProof;
