import React, { useEffect, useRef, useState } from 'react';

const RecommendationsSection = ({ recommendations, airQualityData }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (!hasLoaded) {
            // Use Background Tasks API for lazy loading
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

  const getHealthTips = (aqi) => {
    if (aqi <= 50) {
      return [
        'Perfect time for outdoor activities',
        'Great for morning jogs and cycling',
        'Windows can be opened for fresh air',
        'Ideal for children to play outside'
      ];
    } else if (aqi <= 100) {
      return [
        'Generally safe for outdoor activities',
        'Sensitive individuals should monitor symptoms',
        'Good time for moderate exercise',
        'Consider air purifiers indoors'
      ];
    } else if (aqi <= 150) {
      return [
        'Limit prolonged outdoor exertion',
        'Children and elderly should stay indoors',
        'Use air purifiers and keep windows closed',
        'Wear masks if going outside'
      ];
    } else {
      return [
        'Avoid all outdoor activities',
        'Stay indoors with air purification',
        'Wear N95 masks if you must go out',
        'Seek medical attention if experiencing symptoms'
      ];
    }
  };

  return (
    <section 
      ref={sectionRef}
      className={`recommendations-section ${isVisible ? 'visible' : ''} ${hasLoaded ? 'loaded' : ''}`}
    >
      <h3>💡 Health Recommendations</h3>
      
      {hasLoaded ? (
        <div className="recommendations-content">
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-card ${rec.type}`}>
                <div className="rec-icon">{rec.icon}</div>
                <h4>{rec.title}</h4>
                <p>{rec.description}</p>
              </div>
            ))}
          </div>

          {airQualityData && (
            <div className="health-tips">
              <h4>🏥 Health Tips</h4>
              <ul className="tips-list">
                {getHealthTips(airQualityData.aqi).map((tip, index) => (
                  <li key={index} className="tip-item">
                    <span className="tip-bullet">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="emergency-info">
            <div className="emergency-card">
              <h4>🚨 Emergency Contacts</h4>
              <p><strong>Air Quality Hotline:</strong> 1-800-AIR-QUAL</p>
              <p><strong>Health Emergency:</strong> 911</p>
              <p><strong>Poison Control:</strong> 1-800-222-1222</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="lazy-placeholder">
          <div className="loading-spinner"></div>
          <p>Loading recommendations...</p>
        </div>
      )}
    </section>
  );
};

export default RecommendationsSection;