import React, { useEffect, useRef } from 'react';

const RouteCanvas = ({ route }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || route.length === 0) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size to match display size
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (route.length < 2) {
      // Draw placeholder
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Start tracking to see your route', rect.width / 2, rect.height / 2);
      return;
    }

    // Calculate bounds
    const lats = route.map(p => p.lat);
    const lngs = route.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const padding = 20;
    const width = rect.width - padding * 2;
    const height = rect.height - padding * 2;

    // Convert lat/lng to canvas coordinates
    const toCanvasCoords = (lat, lng) => {
      const x = padding + ((lng - minLng) / (maxLng - minLng)) * width;
      const y = padding + ((maxLat - lat) / (maxLat - minLat)) * height;
      return { x, y };
    };

    // Draw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw route
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const firstPoint = toCanvasCoords(route[0].lat, route[0].lng);
    ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < route.length; i++) {
      const point = toCanvasCoords(route[i].lat, route[i].lng);
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();

    // Draw start point
    const startPoint = toCanvasCoords(route[0].lat, route[0].lng);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Draw current position
    if (route.length > 1) {
      const currentPoint = toCanvasCoords(route[route.length - 1].lat, route[route.length - 1].lng);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add pulsing effect
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 12, 0, 2 * Math.PI);
      ctx.stroke();
    }

  }, [route]);

  return (
    <div className="canvas-container">
      <canvas 
        ref={canvasRef} 
        className="route-canvas"
        style={{ width: '100%', height: '300px' }}
      />
    </div>
  );
};

export default RouteCanvas;