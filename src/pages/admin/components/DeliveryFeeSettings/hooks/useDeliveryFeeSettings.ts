/**
 * useDeliveryFeeSettings Hook
 *
 * Manages delivery fee configuration state with Firestore persistence.
 * Tracks local edits, dirty state, and handles save/reset operations.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getDeliveryFeeConfig,
  saveDeliveryFeeConfig,
  resetDeliveryFeeConfigToDefaults,
} from '../../../../../services/api/deliveryFeeConfigApi';
import { DEFAULT_CONFIG } from '../../../../../services/delivery/constants';
import type { DeliveryFeeConfig, DistanceTier } from '../../../../../services/delivery/types';

interface UseDeliveryFeeSettingsReturn {
  // Current config state (local edits)
  config: DeliveryFeeConfig;

  // Original config from Firestore (for dirty comparison)
  savedConfig: DeliveryFeeConfig;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Error state
  error: string | null;

  // Dirty state (has unsaved changes)
  isDirty: boolean;

  // Config setters
  setEnabled: (enabled: boolean) => void;
  setBaseFee: (value: number) => void;
  setMinFee: (value: number) => void;
  setMaxFee: (value: number) => void;
  setMaxDeliveryDistance: (value: number) => void;
  setDiscountPercentage: (value: number) => void;
  setDiscountEligibleOrders: (value: number) => void;

  // Tier operations
  updateTier: (index: number, field: keyof DistanceTier, value: number) => void;
  addTier: () => void;
  removeTier: (index: number) => void;

  // Persistence operations
  saveConfig: (userId: string) => Promise<void>;
  resetToDefaults: (userId: string) => Promise<void>;
  discardChanges: () => void;
}

export function useDeliveryFeeSettings(): UseDeliveryFeeSettingsReturn {
  const [config, setConfig] = useState<DeliveryFeeConfig>(DEFAULT_CONFIG);
  const [savedConfig, setSavedConfig] = useState<DeliveryFeeConfig>(DEFAULT_CONFIG);
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
        const fetchedConfig = await getDeliveryFeeConfig();

        if (!isCancelled) {
          setConfig(fetchedConfig);
          setSavedConfig(fetchedConfig);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching delivery fee config:', err);
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

  // Config setters
  const setEnabled = useCallback((enabled: boolean) => {
    setConfig((prev) => ({ ...prev, enabled }));
  }, []);

  const setBaseFee = useCallback((baseFee: number) => {
    setConfig((prev) => ({ ...prev, baseFee }));
  }, []);

  const setMinFee = useCallback((minFee: number) => {
    setConfig((prev) => ({ ...prev, minFee }));
  }, []);

  const setMaxFee = useCallback((maxFee: number) => {
    setConfig((prev) => ({ ...prev, maxFee }));
  }, []);

  const setMaxDeliveryDistance = useCallback((maxDeliveryDistance: number) => {
    setConfig((prev) => ({ ...prev, maxDeliveryDistance }));
  }, []);

  const setDiscountPercentage = useCallback((discountPercentage: number) => {
    setConfig((prev) => ({ ...prev, discountPercentage }));
  }, []);

  const setDiscountEligibleOrders = useCallback((discountEligibleOrders: number) => {
    setConfig((prev) => ({ ...prev, discountEligibleOrders }));
  }, []);

  // Tier operations
  const updateTier = useCallback(
    (index: number, field: keyof DistanceTier, value: number) => {
      setConfig((prev) => ({
        ...prev,
        tiers: prev.tiers.map((tier, i) =>
          i === index ? { ...tier, [field]: value } : tier
        ),
      }));
    },
    []
  );

  const addTier = useCallback(() => {
    setConfig((prev) => {
      const lastTier = prev.tiers[prev.tiers.length - 1];
      const newTier: DistanceTier = {
        fromKm: lastTier ? lastTier.toKm : 0,
        toKm: lastTier ? lastTier.toKm + 10 : 10,
        ratePerKm: lastTier ? lastTier.ratePerKm : 0,
      };
      return {
        ...prev,
        tiers: [...prev.tiers, newTier],
      };
    });
  }, []);

  const removeTier = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index),
    }));
  }, []);

  // Save config to Firestore
  const saveConfig = useCallback(
    async (userId: string) => {
      try {
        setIsSaving(true);
        setError(null);
        await saveDeliveryFeeConfig(config, userId);
        setSavedConfig(config);
      } catch (err) {
        console.error('Error saving delivery fee config:', err);
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
      await resetDeliveryFeeConfigToDefaults(userId);
      setConfig(DEFAULT_CONFIG);
      setSavedConfig(DEFAULT_CONFIG);
    } catch (err) {
      console.error('Error resetting delivery fee config:', err);
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
    setEnabled,
    setBaseFee,
    setMinFee,
    setMaxFee,
    setMaxDeliveryDistance,
    setDiscountPercentage,
    setDiscountEligibleOrders,
    updateTier,
    addTier,
    removeTier,
    saveConfig,
    resetToDefaults,
    discardChanges,
  };
}
