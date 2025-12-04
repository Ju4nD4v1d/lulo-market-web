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

// Input validation constants
const MAX_STREET_LENGTH = 200;
const MAX_CITY_LENGTH = 100;
const MAX_PROVINCE_LENGTH = 50;
const MAX_POSTAL_CODE_LENGTH = 10;

/**
 * Sanitize and validate an address component
 * @param value - Input value
 * @param maxLength - Maximum allowed length
 * @returns Sanitized value or null if invalid
 */
const sanitizeAddressComponent = (value: string | undefined, maxLength: number): string | null => {
  if (!value || typeof value !== 'string') return null;

  // Trim and limit length
  const trimmed = value.trim().slice(0, maxLength);

  if (trimmed.length === 0) return null;

  // Check for potentially dangerous patterns (XSS, injection attempts)
  if (/<script|javascript:|on\w+=/i.test(trimmed)) {
    return null;
  }

  return trimmed;
};

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

  // Validate and sanitize inputs
  const street = sanitizeAddressComponent(addressComponents.street, MAX_STREET_LENGTH);
  const city = sanitizeAddressComponent(addressComponents.city, MAX_CITY_LENGTH);
  const province = sanitizeAddressComponent(addressComponents.province, MAX_PROVINCE_LENGTH);
  const postalCode = sanitizeAddressComponent(addressComponents.postalCode, MAX_POSTAL_CODE_LENGTH);
  const country = sanitizeAddressComponent(addressComponents.country, 50) || 'Canada';

  // Check for missing required fields
  if (!street || !city || !province || !postalCode) {
    return {
      success: false,
      error: 'Please provide a complete address',
    };
  }

  // Validate postal code format
  if (!isValidCanadianPostalCode(postalCode)) {
    return {
      success: false,
      error: 'Please enter a valid Canadian postal code',
    };
  }

  // Construct full address string
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
      // Log status for debugging, but don't expose to user
      console.error('Geocoding API status:', data.status);
      return {
        success: false,
        error: 'Unable to validate address. Please check and try again.',
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
  // Letters D, F, I, O, Q, U are not used in Canadian postal codes
  // W and Z are not used as the first letter (FSA)
  const regex = /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]\d[ABCEGHJKLMNPRSTVWXYZ]\d$/;
  return regex.test(cleaned);
};
