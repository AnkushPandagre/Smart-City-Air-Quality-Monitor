import React, { useEffect, useRef } from 'react';

const StatsCanvas = ({ stats, route }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
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

    if (route.length < 2) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Performance data will appear here', rect.width / 2, rect.height / 2);
      return;
    }

    // Calculate speed data points
    const speedData = [];
    for (let i = 1; i < route.length; i++) {
      const prev = route[i - 1];
      const curr = route[i];
      const distance = calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      const timeDiff = (curr.timestamp - prev.timestamp) / 1000;
      const speed = distance / timeDiff * 3.6; // km/h
      speedData.push(speed);
    }

    if (speedData.length === 0) return;

    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    const maxSpeed = Math.max(...speedData, 10);

    // Draw axes
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, rect.height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, rect.height - padding);
    ctx.lineTo(rect.width - padding, rect.height - padding);
    ctx.stroke();

    // Draw speed line
    if (speedData.length > 1) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < speedData.length; i++) {
        const x = padding + (i / (speedData.length - 1)) * chartWidth;
        const y = rect.height - padding - (speedData[i] / maxSpeed) * chartHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw data points
      ctx.fillStyle = '#8b5cf6';
      for (let i = 0; i < speedData.length; i++) {
        const x = padding + (i / (speedData.length - 1)) * chartWidth;
        const y = rect.height - padding - (speedData[i] / maxSpeed) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Draw labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    // Y-axis labels
    for (let i = 0; i <= 4; i++) {
      const speed = (maxSpeed / 4) * i;
      const y = rect.height - padding - (i / 4) * chartHeight;
      ctx.textAlign = 'right';
      ctx.fillText(speed.toFixed(1), padding - 10, y + 4);
    }

    // Title
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Speed Over Time (km/h)', rect.width / 2, 20);

  }, [stats, route]);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="canvas-container">
      <canvas 
        ref={canvasRef} 
        className="stats-canvas"
        style={{ width: '100%', height: '250px' }}
      />
    </div>
  );
};

export default StatsCanvas;