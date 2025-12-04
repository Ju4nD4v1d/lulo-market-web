/**
 * usePlatformFeeConfig Hook
 *
 * Fetches and caches the platform fee configuration from Firestore.
 * Used by checkout flow to get the current platform fee value.
 */

import { useState, useEffect } from 'react';
import { getPlatformFeeConfig } from '../services/api/platformFeeConfigApi';
import { DEFAULT_PLATFORM_FEE_CONFIG } from '../services/platformFee/constants';
import type { PlatformFeeConfig } from '../services/platformFee/types';

interface UsePlatformFeeConfigReturn {
  /** The full platform fee configuration */
  config: PlatformFeeConfig;
  /** Whether the config is currently loading */
  isLoading: boolean;
  /** The platform fee amount to charge (0 if disabled) */
  platformFee: number;
}

/**
 * Hook to fetch and cache platform fee configuration
 *
 * @returns Platform fee config, loading state, and computed fee amount
 */
export function usePlatformFeeConfig(): UsePlatformFeeConfigReturn {
  const [config, setConfig] = useState<PlatformFeeConfig>(DEFAULT_PLATFORM_FEE_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchConfig = async () => {
      try {
        const fetchedConfig = await getPlatformFeeConfig();
        if (!isCancelled) {
          setConfig(fetchedConfig);
        }
      } catch (error) {
        console.error('Error fetching platform fee config:', error);
        // Keep defaults on error
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchConfig();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Compute the fee amount: 0 if disabled, otherwise the configured amount
  const platformFee = config.enabled ? config.fixedAmount : 0;

  return {
    config,
    isLoading,
    platformFee,
  };
}
