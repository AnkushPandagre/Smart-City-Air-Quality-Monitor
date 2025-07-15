import React, { useEffect, useRef } from 'react';

const LocationTracker = ({ onLocationUpdate }) => {
  const watchIdRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000 // Cache location for 1 minute
    };

    const handleSuccess = (position) => {
      const now = Date.now();
      
      // Throttle updates to every 30 seconds
      if (now - lastUpdateRef.current < 30000) {
        return;
      }

      lastUpdateRef.current = now;

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: now
      };

      // Use Background Tasks API to process location update
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          onLocationUpdate(location);
        });
      } else {
        setTimeout(() => onLocationUpdate(location), 0);
      }
    };

    const handleError = (error) => {
      console.error('Geolocation error:', error);
      
      // Provide fallback location (example: San Francisco)
      const fallbackLocation = {
        lat: 37.7749,
        lng: -122.4194,
        accuracy: 1000,
        timestamp: Date.now(),
        isFallback: true
      };

      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert('Location access denied. Using default location for demo.');
          onLocationUpdate(fallbackLocation);
          break;
        case error.POSITION_UNAVAILABLE:
          alert('Location information unavailable. Using default location.');
          onLocationUpdate(fallbackLocation);
          break;
        case error.TIMEOUT:
          alert('Location request timed out. Using default location.');
          onLocationUpdate(fallbackLocation);
          break;
        default:
          alert('An unknown error occurred. Using default location.');
          onLocationUpdate(fallbackLocation);
          break;
      }
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // Watch position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [onLocationUpdate]);

  return null;
};

export default LocationTracker;