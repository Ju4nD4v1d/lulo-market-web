/**
 * Geocoding utility functions for address validation and coordinate retrieval
 * Uses Google Maps Geocoding API
 */

export interface AddressComponents {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface GeocodeResult {
  success: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  formattedAddress?: string;
  error?: string;
}

/**
 * Geocode a Canadian address to get coordinates
 * @param addressComponents - Address components (street, city, province, postal code)
 * @returns GeocodeResult with coordinates or error
 */
export const geocodeAddress = async (
  addressComponents: AddressComponents
): Promise<GeocodeResult> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Google Maps API key is not configured',
    };
  }

  // Construct full address string
  const { street, city, province, postalCode, country } = addressComponents;
  const fullAddress = `${street}, ${city}, ${province} ${postalCode}, ${country}`;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress
      )}&key=${apiKey}&components=country:CA`
    );

    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to connect to geocoding service',
      };
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;

      // Verify it's in Canada
      const countryComponent = result.address_components.find((component: any) =>
        component.types.includes('country')
      );

      if (countryComponent?.short_name !== 'CA') {
        return {
          success: false,
          error: 'Address must be in Canada',
        };
      }

      return {
        success: true,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
      };
    } else if (data.status === 'ZERO_RESULTS') {
      return {
        success: false,
        error: 'Address not found. Please check and try again.',
      };
    } else if (data.status === 'INVALID_REQUEST') {
      return {
        success: false,
        error: 'Invalid address format. Please check your input.',
      };
    } else {
      return {
        success: false,
        error: `Geocoding error: ${data.status}`,
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      error: 'Failed to validate address. Please try again.',
    };
  }
};

/**
 * Validate if address components are complete
 * @param addressComponents - Address components to validate (accepts both 'street' and 'address' field names)
 * @returns true if all required fields are filled
 */
export const isAddressComplete = (addressComponents: Partial<AddressComponents> | { address?: string; city?: string; province?: string; postalCode?: string }): boolean => {
  // Support both 'street' and 'address' field names for compatibility
  const street = 'street' in addressComponents ? addressComponents.street : ('address' in addressComponents ? addressComponents.address : undefined);

  return Boolean(
    street?.trim() &&
    addressComponents.city?.trim() &&
    addressComponents.province?.trim() &&
    addressComponents.postalCode?.trim()
  );
};

/**
 * Format Canadian postal code (e.g., "h3a2b4" -> "H3A 2B4")
 * @param postalCode - Raw postal code input
 * @returns Formatted postal code
 */
export const formatCanadianPostalCode = (postalCode: string): string => {
  // Remove spaces and convert to uppercase
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();

  // Canadian postal code format: A1A 1A1
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }

  return cleaned;
};

/**
 * Validate Canadian postal code format
 * @param postalCode - Postal code to validate
 * @returns true if valid Canadian postal code
 */
export const isValidCanadianPostalCode = (postalCode: string): boolean => {
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
  // Canadian postal code regex: A1A1A1
  const regex = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;
  return regex.test(cleaned);
};
