/**
 * Google Maps API dynamic loader utility
 * Loads the Google Maps JavaScript API asynchronously when needed
 */

interface GoogleMapsLoaderOptions {
  apiKey?: string;
  libraries?: string[];
  language?: string;
  region?: string;
}

let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * Dynamically loads the Google Maps JavaScript API
 * @param options - Configuration options for the API
 * @returns Promise that resolves when the API is loaded
 */
export const loadGoogleMapsAPI = async (options: GoogleMapsLoaderOptions = {}): Promise<void> => {
  // If already loaded, return immediately
  if (isLoaded && window.google && window.google.maps) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Get API key from options or environment variable
  const apiKey = options.apiKey || 
                 import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
                 'AIzaSyDrqIE1Zs8YVmaZUdrJgCaOiKIczdz5Hag'; // Fallback

  if (!apiKey) {
    throw new Error('Google Maps API key is required. Set VITE_GOOGLE_MAPS_API_KEY environment variable.');
  }

  const {
    libraries = ['places'],
    language = 'en',
    region = 'CA'
  } = options;

  // Create the loading promise
  loadPromise = new Promise<void>((resolve, reject) => {
    isLoading = true;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    
    // Build URL with parameters
    const params = new URLSearchParams({
      key: apiKey,
      libraries: libraries.join(','),
      language: language,
      region: region,
      loading: 'async' // This tells Google Maps to load asynchronously
    });

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;

    // Handle load success
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      console.log('✅ Google Maps API loaded successfully');
      resolve();
    };

    // Handle load error
    script.onerror = (error) => {
      isLoading = false;
      loadPromise = null;
      console.error('❌ Failed to load Google Maps API:', error);
      reject(new Error('Failed to load Google Maps API'));
    };

    // Add to document head
    document.head.appendChild(script);
  });

  return loadPromise;
};

/**
 * Check if Google Maps API is already loaded and available
 * @returns boolean indicating if the API is ready to use
 */
export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && !!(window.google && window.google.maps);
};

/**
 * Get Google Maps API with automatic loading
 * @param options - Configuration options for the API
 * @returns Promise that resolves to the Google Maps API object
 */
export const getGoogleMapsAPI = async (options: GoogleMapsLoaderOptions = {}): Promise<typeof google.maps> => {
  await loadGoogleMapsAPI(options);
  
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps API failed to load properly');
  }
  
  return window.google.maps;
};

// Global type declarations for Google Maps
declare global {
  interface Window {
    google: {
      maps: typeof google.maps;
    };
  }
}