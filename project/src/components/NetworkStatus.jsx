import React, { useEffect, useState } from 'react';

const NetworkStatus = ({ onNetworkChange }) => {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
        setNetworkInfo(info);
        onNetworkChange(info);
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }

    // Fallback: basic online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onNetworkChange]);

  const getConnectionIcon = () => {
    if (!isOnline) return '📡❌';
    if (!networkInfo) return '📡';
    
    switch (networkInfo.effectiveType) {
      case 'slow-2g': return '📡🟥';
      case '2g': return '📡🟨';
      case '3g': return '📡🟦';
      case '4g': return '📡🟩';
      default: return '📡';
    }
  };

  const getConnectionText = () => {
    if (!isOnline) return 'Offline';
    if (!networkInfo) return 'Online';
    return networkInfo.effectiveType.toUpperCase();
  };

  return (
    <div className="network-status">
      <span className="network-icon">{getConnectionIcon()}</span>
      <span className="network-text">{getConnectionText()}</span>
    </div>
  );
};

export default NetworkStatus;