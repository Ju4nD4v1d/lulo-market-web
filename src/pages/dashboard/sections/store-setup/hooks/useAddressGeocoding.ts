/**
 * Hook for managing address geocoding state and operations
 */

import { useState } from 'react';
import { geocodeAddress, AddressComponents, GeocodeResult } from '../../../../../utils/geocoding';

export const useAddressGeocoding = () => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  /**
   * Geocode an address and return the result
   * @param addressComponents - Address components to geocode
   * @returns GeocodeResult with coordinates or error
   */
  const geocode = async (addressComponents: AddressComponents): Promise<GeocodeResult> => {
    setIsGeocoding(true);
    setGeocodingError(null);

    try {
      const result = await geocodeAddress(addressComponents);

      if (!result.success) {
        setGeocodingError(result.error || 'Failed to geocode address');
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred while validating the address';
      setGeocodingError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsGeocoding(false);
    }
  };

  /**
   * Clear geocoding error
   */
  const clearError = () => {
    setGeocodingError(null);
  };

  return {
    geocode,
    isGeocoding,
    geocodingError,
    clearError,
  };
};
