import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { MapPin, Loader2 } from 'lucide-react';
import type { Coordinates, StoreLocation } from '../types/store';

interface LocationPickerProps {
  value: StoreLocation;
  onChange: (location: StoreLocation) => void;
  onError: (error: string) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 43.6532,
  lng: -79.3832 // Toronto coordinates as default
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<Coordinates>(
    value.coordinates.lat ? value.coordinates : defaultCenter
  );
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  const handleGeocoding = async () => {
    if (!value.address) {
      onError('Please enter an address');
      return;
    }

    setIsLoading(true);
    try {
      if (!geocoder.current) {
        geocoder.current = new google.maps.Geocoder();
      }

      const result = await geocoder.current.geocode({ address: value.address });
      
      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        const newCoordinates = {
          lat: location.lat(),
          lng: location.lng()
        };
        setMapCenter(newCoordinates);
        onChange({
          address: result.results[0].formatted_address,
          coordinates: newCoordinates,
          placeId: result.results[0].place_id
        });
      } else {
        onError('No results found for this address');
      }
    } catch (error) {
      onError('Failed to geocode address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const clickedLat = e.latLng.lat();
    const clickedLng = e.latLng.lng();
    
    try {
      if (!geocoder.current) {
        geocoder.current = new google.maps.Geocoder();
      }

      const result = await geocoder.current.geocode({
        location: { lat: clickedLat, lng: clickedLng }
      });

      if (result.results[0]) {
        onChange({
          address: result.results[0].formatted_address,
          coordinates: { lat: clickedLat, lng: clickedLng },
          placeId: result.results[0].place_id
        });
      }
    } catch (error) {
      onError('Failed to get address for this location');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleGeocoding}
          disabled={isLoading || !value.address}
          className={`
            inline-flex items-center px-4 py-2 rounded-lg
            ${isLoading || !value.address
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}
            transition-colors duration-200
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Getting location...</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              <span>Get Location</span>
            </>
          )}
        </button>
      </div>

      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {value.coordinates.lat && (
            <Marker
              position={value.coordinates}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {value.coordinates.lat && (
        <p className="text-sm text-gray-500">
          Selected location: {value.address}
        </p>
      )}
    </div>
  );
};