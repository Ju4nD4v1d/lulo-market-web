import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  hasNetworkError: boolean;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasNetworkError, setHasNetworkError] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setHasNetworkError(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasNetworkError(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test network connectivity on mount
    const testConnectivity = async () => {
      try {
        // Test with a simple request to the current origin
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(window.location.origin, {
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        setIsOnline(response.ok);
        setHasNetworkError(!response.ok);
      } catch {
        // If fetch fails, we're likely offline or have network issues
        setIsOnline(false);
        setHasNetworkError(true);
      }
    };

    testConnectivity();

    // Cleanup event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    hasNetworkError
  };
};