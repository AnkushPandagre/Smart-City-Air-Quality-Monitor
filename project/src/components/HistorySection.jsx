import React, { useEffect, useRef, useState } from 'react';

const HistorySection = ({ historicalData, currentLocation }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

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

  useEffect(() => {
    if (!hasLoaded || !historicalData.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (historicalData.length < 2) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Collecting historical data...', rect.width / 2, rect.height / 2);
      return;
    }

    const padding = 50;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    const maxAQI = Math.max(...historicalData.map(d => d.aqi), 100);
    const minAQI = Math.min(...historicalData.map(d => d.aqi), 0);

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding + (i / 6) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, rect.height - padding);
      ctx.stroke();
    }

    // Draw AQI trend line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    historicalData.forEach((data, index) => {
      const x = padding + (index / (historicalData.length - 1)) * chartWidth;
      const y = rect.height - padding - ((data.aqi - minAQI) / (maxAQI - minAQI)) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points with AQI color coding
    historicalData.forEach((data, index) => {
      const x = padding + (index / (historicalData.length - 1)) * chartWidth;
      const y = rect.height - padding - ((data.aqi - minAQI) / (maxAQI - minAQI)) * chartHeight;
      
      // Get AQI color
      let color = '#00e400';
      if (data.aqi > 50) color = '#ffff00';
      if (data.aqi > 100) color = '#ff7e00';
      if (data.aqi > 150) color = '#ff0000';
      if (data.aqi > 200) color = '#8f3f97';
      if (data.aqi > 300) color = '#7e0023';
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // White border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw axes labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter, sans-serif';
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = minAQI + (i / 5) * (maxAQI - minAQI);
      const y = rect.height - padding - (i / 5) * chartHeight;
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }

    // X-axis labels (time)
    const timeLabels = historicalData.map(d => {
      const date = new Date(d.timestamp);
      return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0');
    });

    for (let i = 0; i < Math.min(timeLabels.length, 7); i++) {
      const x = padding + (i / 6) * chartWidth;
      ctx.textAlign = 'center';
      ctx.fillText(timeLabels[Math.floor(i * (timeLabels.length - 1) / 6)], x, rect.height - padding + 20);
    }

    // Chart title
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AQI Trend (Last 24 Hours)', rect.width / 2, 25);

    // Y-axis title
    ctx.save();
    ctx.translate(15, rect.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Air Quality Index', 0, 0);
    ctx.restore();

  }, [historicalData, hasLoaded]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <section 
      ref={sectionRef}
      className={`history-section ${isVisible ? 'visible' : ''} ${hasLoaded ? 'loaded' : ''}`}
    >
      <h3>📊 Historical Data</h3>
      
      {hasLoaded ? (
        <div className="history-content">
          <div className="chart-container">
            <canvas 
              ref={canvasRef} 
              className="history-canvas"
              style={{ width: '100%', height: '300px' }}
            />
          </div>

          {historicalData.length > 0 && (
            <div className="recent-readings">
              <h4>Recent Readings</h4>
              <div className="readings-list">
                {historicalData.slice(-5).reverse().map((data, index) => (
                  <div key={index} className="reading-item">
                    <div className="reading-time">{formatTime(data.timestamp)}</div>
                    <div className="reading-aqi" style={{ 
                      backgroundColor: data.aqi <= 50 ? '#00e400' : 
                                     data.aqi <= 100 ? '#ffff00' : 
                                     data.aqi <= 150 ? '#ff7e00' : '#ff0000'
                    }}>
                      {data.aqi}
                    </div>
                    <div className="reading-pollutants">
                      PM2.5: {data.pm25} | PM10: {data.pm10} | O₃: {data.o3}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="lazy-placeholder">
          <div className="loading-spinner"></div>
          <p>Loading historical data...</p>
        </div>
      )}
    </section>
  );
};

export default HistorySection;