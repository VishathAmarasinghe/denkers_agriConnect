import { useState, useEffect } from 'react';
import weatherService, { WeatherData, LocationData } from '@/utils/weatherService';

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current location
      const location = await weatherService.getCurrentLocation();
      if (!location) {
        setError('Unable to get location. Please check location permissions.');
        setLoading(false);
        return;
      }

      setLocationData(location);

      // Get weather data for the location
      const weather = await weatherService.getWeatherData(location.latitude, location.longitude);
      if (!weather) {
        setError('Unable to fetch weather data.');
        setLoading(false);
        return;
      }

      setWeatherData(weather);
      setLoading(false);
    } catch (err) {
      console.error('Error in useWeather hook:', err);
      setError('Failed to fetch weather data. Please try again.');
      setLoading(false);
    }
  };

  const refreshWeather = () => {
    fetchWeatherData();
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  return {
    weatherData,
    locationData,
    loading,
    error,
    refreshWeather,
  };
};
