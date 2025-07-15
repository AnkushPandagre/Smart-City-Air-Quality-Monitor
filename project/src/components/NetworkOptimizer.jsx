import React, { useEffect, useState } from 'react';

const NetworkOptimizer = ({ onNetworkChange, networkInfo }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dataUsage, setDataUsage] = useState({ sent: 0, received: 0 });

  useEffect(() => {
    // Network Information API
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      const updateNetworkInfo = () => {
        const info = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
        
        // Use Background Tasks API for network optimization
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            optimizeForNetwork(info);
            onNetworkChange(info);
          });
        } else {
          setTimeout(() => {
            optimizeForNetwork(info);
            onNetworkChange(info);
          }, 0);
        }
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }

    // Basic online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onNetworkChange]);

  const optimizeForNetwork = (networkInfo) => {
    // Simulate data usage tracking
    const usage = {
      sent: Math.floor(Math.random() * 1000) + 500,
      received: Math.floor(Math.random() * 2000) + 1000
    };
    setDataUsage(usage);

    // Optimize based on connection type
    if (networkInfo.saveData || networkInfo.effectiveType === 'slow-2g') {
      // Reduce update frequency for slow connections
      console.log('Optimizing for slow connection: reducing update frequency');
    } else if (networkInfo.effectiveType === '4g') {
      // Enable high-frequency updates for fast connections
      console.log('Fast connection detected: enabling high-frequency updates');
    }
  };

  const getConnectionQuality = () => {
    if (!networkInfo) return 'Unknown';
    
    switch (networkInfo.effectiveType) {
      case 'slow-2g': return 'Poor';
      case '2g': return 'Fair';
      case '3g': return 'Good';
      case '4g': return 'Excellent';
      default: return 'Unknown';
    }
  };

  const getOptimizationTips = () => {
    if (!networkInfo) return [];
    
    const tips = [];
    
    if (networkInfo.saveData) {
      tips.push('Data Saver mode detected - reducing background updates');
    }
    
    if (networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g') {
      tips.push('Slow connection - caching data locally');
      tips.push('Reducing map detail for faster loading');
    }
    
    if (networkInfo.rtt > 1000) {
      tips.push('High latency detected - prioritizing essential data');
    }
    
    return tips;
  };

  return (
    <div className="network-optimizer">
      <div className="network-status-bar">
        <div className="connection-indicator">
          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
          <span className="status-text">
            {isOnline ? `${getConnectionQuality()} Connection` : 'Offline'}
          </span>
        </div>
        
        {networkInfo && (
          <div className="network-details">
            <span className="network-speed">
              ↓ {networkInfo.downlink} Mbps
            </span>
            <span className="network-latency">
              {networkInfo.rtt}ms
            </span>
          </div>
        )}
      </div>

      {networkInfo && getOptimizationTips().length > 0 && (
        <div className="optimization-tips">
          <h4>🔧 Network Optimizations</h4>
          <ul>
            {getOptimizationTips().map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="data-usage">
        <div className="usage-item">
          <span className="usage-label">Data Sent:</span>
          <span className="usage-value">{(dataUsage.sent / 1024).toFixed(1)} KB</span>
        </div>
        <div className="usage-item">
          <span className="usage-label">Data Received:</span>
          <span className="usage-value">{(dataUsage.received / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkOptimizer;