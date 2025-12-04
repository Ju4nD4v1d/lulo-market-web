/**
 * usePlatformFeeSettings Hook
 *
 * Manages platform fee configuration state with Firestore persistence.
 * Tracks local edits, dirty state, and handles save/reset operations.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPlatformFeeConfig,
  savePlatformFeeConfig,
  resetPlatformFeeConfigToDefaults,
} from '../../../../../services/api/platformFeeConfigApi';
import { DEFAULT_PLATFORM_FEE_CONFIG } from '../../../../../services/platformFee/constants';
import type { PlatformFeeConfig } from '../../../../../services/platformFee/types';

// Validation constants for platform fee
export const PLATFORM_FEE_LIMITS = {
  MIN: 0,
  MAX: 50, // Reasonable maximum for a platform fee in CAD
} as const;

// Validation constants for commission rate
export const COMMISSION_RATE_LIMITS = {
  MIN: 0,    // 0%
  MAX: 0.5,  // 50% maximum
} as const;

interface UsePlatformFeeSettingsReturn {
  // Current config state (local edits)
  config: PlatformFeeConfig;

  // Original config from Firestore (for dirty comparison)
  savedConfig: PlatformFeeConfig;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Error state
  error: string | null;

  // Dirty state (has unsaved changes)
  isDirty: boolean;

  // Config setters
  setFixedAmount: (value: number) => void;
  setEnabled: (enabled: boolean) => void;
  setCommissionRate: (rate: number) => void;

  // Persistence operations
  saveConfig: (userId: string) => Promise<void>;
  resetToDefaults: (userId: string) => Promise<void>;
  discardChanges: () => void;
}

export function usePlatformFeeSettings(): UsePlatformFeeSettingsReturn {
  const [config, setConfig] = useState<PlatformFeeConfig>(DEFAULT_PLATFORM_FEE_CONFIG);
  const [savedConfig, setSavedConfig] = useState<PlatformFeeConfig>(DEFAULT_PLATFORM_FEE_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch config on mount
  useEffect(() => {
    let isCancelled = false;

    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedConfig = await getPlatformFeeConfig();

        if (!isCancelled) {
          setConfig(fetchedConfig);
          setSavedConfig(fetchedConfig);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching platform fee config:', err);
          setError('Failed to load configuration');
        }
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

  // Check if there are unsaved changes
  const isDirty = JSON.stringify(config) !== JSON.stringify(savedConfig);

  // Validate a platform fee value
  const validateFeeAmount = (value: number): { isValid: boolean; error?: string } => {
    if (!isFinite(value) || isNaN(value)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }
    if (value < PLATFORM_FEE_LIMITS.MIN) {
      return { isValid: false, error: `Fee cannot be less than $${PLATFORM_FEE_LIMITS.MIN}` };
    }
    if (value > PLATFORM_FEE_LIMITS.MAX) {
      return { isValid: false, error: `Fee cannot exceed $${PLATFORM_FEE_LIMITS.MAX}` };
    }
    return { isValid: true };
  };

  // Validate commission rate value
  const validateCommissionRate = (rate: number): { isValid: boolean; error?: string } => {
    if (!isFinite(rate) || isNaN(rate)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }
    if (rate < COMMISSION_RATE_LIMITS.MIN) {
      return { isValid: false, error: `Commission rate cannot be less than ${COMMISSION_RATE_LIMITS.MIN * 100}%` };
    }
    if (rate > COMMISSION_RATE_LIMITS.MAX) {
      return { isValid: false, error: `Commission rate cannot exceed ${COMMISSION_RATE_LIMITS.MAX * 100}%` };
    }
    return { isValid: true };
  };

  // Config setters with validation
  const setFixedAmount = useCallback((fixedAmount: number) => {
    const validation = validateFeeAmount(fixedAmount);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid fee amount');
      return;
    }
    setError(null);
    setConfig((prev) => ({ ...prev, fixedAmount }));
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setConfig((prev) => ({ ...prev, enabled }));
  }, []);

  const setCommissionRate = useCallback((commissionRate: number) => {
    const validation = validateCommissionRate(commissionRate);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid commission rate');
      return;
    }
    setError(null);
    setConfig((prev) => ({ ...prev, commissionRate }));
  }, []);

  // Save config to Firestore with validation
  const saveConfigFn = useCallback(
    async (userId: string) => {
      // Validate fee amount before saving
      const feeValidation = validateFeeAmount(config.fixedAmount);
      if (!feeValidation.isValid) {
        setError(feeValidation.error || 'Invalid fee amount');
        throw new Error(feeValidation.error || 'Invalid fee amount');
      }

      // Validate commission rate before saving
      const rateValidation = validateCommissionRate(config.commissionRate);
      if (!rateValidation.isValid) {
        setError(rateValidation.error || 'Invalid commission rate');
        throw new Error(rateValidation.error || 'Invalid commission rate');
      }

      try {
        setIsSaving(true);
        setError(null);
        await savePlatformFeeConfig(config, userId);
        setSavedConfig(config);
      } catch (err) {
        console.error('Error saving platform fee config:', err);
        setError('Failed to save configuration');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [config]
  );

  // Reset to defaults
  const resetToDefaults = useCallback(async (userId: string) => {
    try {
      setIsSaving(true);
      setError(null);
      await resetPlatformFeeConfigToDefaults(userId);
      setConfig(DEFAULT_PLATFORM_FEE_CONFIG);
      setSavedConfig(DEFAULT_PLATFORM_FEE_CONFIG);
    } catch (err) {
      console.error('Error resetting platform fee config:', err);
      setError('Failed to reset configuration');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Discard local changes
  const discardChanges = useCallback(() => {
    setConfig(savedConfig);
    setError(null);
  }, [savedConfig]);

  return {
    config,
    savedConfig,
    isLoading,
    isSaving,
    error,
    isDirty,
    setFixedAmount,
    setEnabled,
    setCommissionRate,
    saveConfig: saveConfigFn,
    resetToDefaults,
    discardChanges,
  };
}
