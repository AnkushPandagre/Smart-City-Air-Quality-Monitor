import React, { useState, useEffect } from 'react';
import './App.css';
import LocationTracker from './components/LocationTracker';
import AirQualityCanvas from './components/AirQualityCanvas';
import RecommendationsSection from './components/RecommendationsSection';
import HistorySection from './components/HistorySection';
import NetworkOptimizer from './components/NetworkOptimizer';

function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate air quality data fetching
  const fetchAirQualityData = (location) => {
    setIsLoading(true);
    
    // Use Background Tasks API for data processing
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        processAirQualityData(location);
      });
    } else {
      setTimeout(() => processAirQualityData(location), 100);
    }
  };

  const processAirQualityData = (location) => {
    // Simulate API response with realistic air quality data
    const mockData = {
      aqi: Math.floor(Math.random() * 200) + 50,
      pm25: Math.floor(Math.random() * 50) + 10,
      pm10: Math.floor(Math.random() * 80) + 20,
      o3: Math.floor(Math.random() * 100) + 30,
      no2: Math.floor(Math.random() * 60) + 15,
      so2: Math.floor(Math.random() * 40) + 5,
      co: Math.floor(Math.random() * 2000) + 500,
      timestamp: Date.now(),
      location: location
    };

    // Generate nearby monitoring stations
    const stations = [];
    for (let i = 0; i < 5; i++) {
      stations.push({
        id: i,
        name: `Station ${i + 1}`,
        lat: location.lat + (Math.random() - 0.5) * 0.02,
        lng: location.lng + (Math.random() - 0.5) * 0.02,
        aqi: Math.floor(Math.random() * 200) + 50,
        distance: Math.random() * 5 + 0.5
      });
    }

    // Generate recommendations based on AQI
    const recs = generateRecommendations(mockData.aqi);
    
    // Add to historical data
    const newHistoricalData = [...historicalData, mockData].slice(-24); // Keep last 24 readings

    setAirQualityData(mockData);
    setNearbyStations(stations);
    setRecommendations(recs);
    setHistoricalData(newHistoricalData);
    setIsLoading(false);
  };

  const generateRecommendations = (aqi) => {
    const recommendations = [];
    
    if (aqi <= 50) {
      recommendations.push({
        type: 'good',
        icon: '🌟',
        title: 'Excellent Air Quality',
        description: 'Perfect for all outdoor activities including jogging and cycling.'
      });
    } else if (aqi <= 100) {
      recommendations.push({
        type: 'moderate',
        icon: '⚠️',
        title: 'Moderate Air Quality',
        description: 'Generally acceptable for most people. Sensitive individuals should consider limiting prolonged outdoor exertion.'
      });
    } else if (aqi <= 150) {
      recommendations.push({
        type: 'unhealthy-sensitive',
        icon: '🚨',
        title: 'Unhealthy for Sensitive Groups',
        description: 'Children, elderly, and people with respiratory conditions should limit outdoor activities.'
      });
    } else {
      recommendations.push({
        type: 'unhealthy',
        icon: '🔴',
        title: 'Unhealthy Air Quality',
        description: 'Everyone should avoid prolonged outdoor exertion. Stay indoors when possible.'
      });
    }

    // Add activity-specific recommendations
    if (aqi <= 100) {
      recommendations.push({
        type: 'activity',
        icon: '🏃‍♂️',
        title: 'Outdoor Exercise',
        description: 'Good conditions for running, cycling, and outdoor sports.'
      });
    } else {
      recommendations.push({
        type: 'activity',
        icon: '🏠',
        title: 'Indoor Activities',
        description: 'Consider indoor workouts or postpone outdoor exercise.'
      });
    }

    return recommendations;
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const handleLocationUpdate = (location) => {
    setCurrentLocation(location);
    fetchAirQualityData(location);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">🌍 AirWatch</h1>
          <div className="location-info">
            {currentLocation && (
              <span className="coordinates">
                📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <section className="hero-section">
          <div className="hero-content">
            <h2>Real-time Air Quality Monitoring</h2>
            <p>Make informed decisions about outdoor activities based on current air quality conditions in your area</p>
            
            {isLoading && (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <p>Fetching air quality data...</p>
              </div>
            )}

            {airQualityData && (
              <div className="aqi-display">
                <div className="aqi-main" style={{ backgroundColor: getAQIColor(airQualityData.aqi) }}>
                  <div className="aqi-value">{airQualityData.aqi}</div>
                  <div className="aqi-label">AQI</div>
                </div>
                <div className="aqi-level">
                  <h3>{getAQILevel(airQualityData.aqi)}</h3>
                  <p>Air Quality Index</p>
                </div>
              </div>
            )}

            {airQualityData && (
              <div className="pollutants-grid">
                <div className="pollutant-card">
                  <div className="pollutant-value">{airQualityData.pm25}</div>
                  <div className="pollutant-label">PM2.5</div>
                  <div className="pollutant-unit">μg/m³</div>
                </div>
                <div className="pollutant-card">
                  <div className="pollutant-value">{airQualityData.pm10}</div>
                  <div className="pollutant-label">PM10</div>
                  <div className="pollutant-unit">μg/m³</div>
                </div>
                <div className="pollutant-card">
                  <div className="pollutant-value">{airQualityData.o3}</div>
                  <div className="pollutant-label">O₃</div>
                  <div className="pollutant-unit">μg/m³</div>
                </div>
                <div className="pollutant-card">
                  <div className="pollutant-value">{airQualityData.no2}</div>
                  <div className="pollutant-label">NO₂</div>
                  <div className="pollutant-unit">μg/m³</div>
                </div>
              </div>
            )}
          </div>
        </section>

        <AirQualityCanvas 
          currentLocation={currentLocation}
          nearbyStations={nearbyStations}
          airQualityData={airQualityData}
        />

        <RecommendationsSection 
          recommendations={recommendations}
          airQualityData={airQualityData}
        />

        <HistorySection 
          historicalData={historicalData}
          currentLocation={currentLocation}
        />
      </main>

      <LocationTracker onLocationUpdate={handleLocationUpdate} />
      <NetworkOptimizer onNetworkChange={setNetworkInfo} networkInfo={networkInfo} />
    </div>
  );
}

export default App;