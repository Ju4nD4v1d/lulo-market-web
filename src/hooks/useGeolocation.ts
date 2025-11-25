import { useState, useCallback } from 'react';

/**
 * Custom hook for managing geolocation state and functionality
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>(
    'idle'
  );

  /**
   * Get city name from coordinates using Google Maps Geocoding API
   */
  const getCityName = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key is not configured');
        return 'Unknown Location';
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const city = addressComponents.find(
          (component: { types: string[]; long_name: string }) =>
            component.types.includes('locality') || component.types.includes('administrative_area_level_1')
        );
        return city ? city.long_name : 'Unknown Location';
      }
    } catch (error) {
      console.error('Error getting city name:', error);
    }
    return 'Unknown Location';
  }, []);

  /**
   * Simulate Vancouver location for testing/fallback
   */
  const simulateVancouverLocation = useCallback(async () => {
    setLocationStatus('requesting');
    const coords = {
      lat: 49.2827,
      lng: -123.1207,
    };
    setLocation(coords);
    setLocationName('Vancouver, BC');
    setLocationStatus('granted');
  }, []);

  /**
   * Request user's current location
   */
  const requestLocation = useCallback(() => {
    setLocationStatus('requesting');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(coords);
          const cityName = await getCityName(coords.lat, coords.lng);
          setLocationName(cityName);
          setLocationStatus('granted');
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationStatus('denied');
          simulateVancouverLocation();
        }
      );
    } else {
      console.error('Geolocation is not supported');
      setLocationStatus('denied');
      simulateVancouverLocation();
    }
  }, [getCityName, simulateVancouverLocation]);

  return {
    location,
    locationName,
    locationStatus,
    requestLocation,
    simulateVancouverLocation,
    getCityName,
  };
};
