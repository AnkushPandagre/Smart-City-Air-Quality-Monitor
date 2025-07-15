import React, { useEffect, useRef } from 'react';

const AirQualityCanvas = ({ currentLocation, nearbyStations, airQualityData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentLocation) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
     
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  
    ctx.clearRect(0, 0, rect.width, rect.height);
 
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, '#e0f2fe');
    gradient.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (nearbyStations.length === 0) {
     
      ctx.fillStyle = '#64748b';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Loading air quality map...', rect.width / 2, rect.height / 2);
      return;
    }

    const allLocations = [currentLocation, ...nearbyStations];
    const lats = allLocations.map(loc => loc.lat);
    const lngs = allLocations.map(loc => loc.lng);
    const minLat = Math.min(...lats) - 0.005;
    const maxLat = Math.max(...lats) + 0.005;
    const minLng = Math.min(...lngs) - 0.005;
    const maxLng = Math.max(...lngs) + 0.005;

    const padding = 40;
    const mapWidth = rect.width - padding * 2;
    const mapHeight = rect.height - padding * 2;

    const toCanvasCoords = (lat, lng) => {
      const x = padding + ((lng - minLng) / (maxLng - minLng)) * mapWidth;
      const y = padding + ((maxLat - lat) / (maxLat - minLat)) * mapHeight;
      return { x, y };
    };

    const getAQIColor = (aqi) => {
      if (aqi <= 50) return '#00e400';
      if (aqi <= 100) return '#ffff00';
      if (aqi <= 150) return '#ff7e00';
      if (aqi <= 200) return '#ff0000';
      if (aqi <= 300) return '#8f3f97';
      return '#7e0023';
    };

    nearbyStations.forEach(station => {
      const coords = toCanvasCoords(station.lat, station.lng);
      const radius = 60;
      
      const heatGradient = ctx.createRadialGradient(
        coords.x, coords.y, 0,
        coords.x, coords.y, radius
      );
      
      const color = getAQIColor(station.aqi);
      heatGradient.addColorStop(0, color + '80');  
      heatGradient.addColorStop(0.7, color + '40');  
      heatGradient.addColorStop(1, color + '00');  
      
      ctx.fillStyle = heatGradient;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, radius, 0, 2 * Math.PI);
      ctx.fill();
    });

     
    nearbyStations.forEach(station => {
      const coords = toCanvasCoords(station.lat, station.lng);
       
      ctx.fillStyle = getAQIColor(station.aqi);
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
       
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
     
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(station.aqi.toString(), coords.x, coords.y - 15);
      
     
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(station.name, coords.x, coords.y + 25);
    });

    
    const currentCoords = toCanvasCoords(currentLocation.lat, currentLocation.lng);
    
     
    const pulseRadius = 15 + Math.sin(Date.now() / 500) * 3;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(currentCoords.x, currentCoords.y, pulseRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(currentCoords.x, currentCoords.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(currentCoords.x, currentCoords.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('You are here', currentCoords.x, currentCoords.y - 25);

    const legendX = rect.width - 150;
    const legendY = 20;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(legendX - 10, legendY - 10, 140, 120);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX - 10, legendY - 10, 140, 120);
    
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('AQI Levels', legendX, legendY + 10);
    
    const levels = [
      { range: '0-50', color: '#00e400', label: 'Good' },
      { range: '51-100', color: '#ffff00', label: 'Moderate' },
      { range: '101-150', color: '#ff7e00', label: 'Unhealthy' },
      { range: '151+', color: '#ff0000', label: 'Very Unhealthy' }
    ];
    
    levels.forEach((level, index) => {
      const y = legendY + 25 + index * 20;
      
      ctx.fillStyle = level.color;
      ctx.fillRect(legendX, y, 12, 12);
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${level.range} - ${level.label}`, legendX + 18, y + 9);
    });

  }, [currentLocation, nearbyStations, airQualityData]);

  return (
    <section className="map-section">
      <h3>🗺️ Air Quality Map</h3>
      <p>Real-time air quality conditions in your area</p>
      <div className="canvas-container">
        <canvas 
          ref={canvasRef} 
          className="air-quality-canvas"
          style={{ width: '100%', height: '400px' }}
        />
      </div>
    </section>
  );
};

export default AirQualityCanvas;