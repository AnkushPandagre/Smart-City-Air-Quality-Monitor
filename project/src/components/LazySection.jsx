import React, { useEffect, useRef, useState } from 'react';

const LazySection = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (!hasLoaded) {
            // Use background task for lazy loading processing
            if ('requestIdleCallback' in window) {
              requestIdleCallback(() => {
                setHasLoaded(true);
              });
            } else {
              setTimeout(() => setHasLoaded(true), 100);
            }
          }
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasLoaded]);

  return (
    <section 
      ref={sectionRef}
      className={`lazy-section ${className} ${isVisible ? 'visible' : ''} ${hasLoaded ? 'loaded' : ''}`}
    >
      {hasLoaded ? children : (
        <div className="lazy-placeholder">
          <div className="loading-spinner"></div>
          <p>Loading content...</p>
        </div>
      )}
    </section>
  );
};

export default LazySection;