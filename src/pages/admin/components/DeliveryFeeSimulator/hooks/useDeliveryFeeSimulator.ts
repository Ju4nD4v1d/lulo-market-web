/**
 * Hook for managing Delivery Fee Simulator state
 *
 * Loads initial config from Firestore on mount, then allows local editing
 * for testing purposes. Changes are NOT persisted - they reset on page reload.
 */

import { useState, useEffect, useCallback } from 'react';
import { getDeliveryFeeConfig } from '../../../../../services/api/deliveryFeeConfigApi';
import { DEFAULT_CONFIG } from '../../../../../services/delivery/constants';
import type { DeliveryFeeConfig, DistanceTier } from '../../../../../services/delivery/types';

interface UseDeliveryFeeSimulatorReturn {
  /** Current delivery fee configuration (editable locally for testing) */
  config: DeliveryFeeConfig;
  /** Whether the simulator section is expanded */
  isExpanded: boolean;
  /** Toggle the expanded state */
  toggleExpanded: () => void;
  /** Loading state while fetching config */
  isLoading: boolean;
  /** Config setters for local testing (not persisted) */
  setBaseFee: (value: number) => void;
  setMinFee: (value: number) => void;
  setMaxFee: (value: number) => void;
  /** Tier operations for local testing (not persisted) */
  updateTier: (index: number, field: keyof DistanceTier, value: number) => void;
  addTier: () => void;
  removeTier: (index: number) => void;
  /** Reset to saved Firestore values */
  resetToSaved: () => void;
}

export function useDeliveryFeeSimulator(): UseDeliveryFeeSimulatorReturn {
  const [config, setConfig] = useState<DeliveryFeeConfig>(DEFAULT_CONFIG);
  const [savedConfig, setSavedConfig] = useState<DeliveryFeeConfig>(DEFAULT_CONFIG);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch config from Firestore on mount
  useEffect(() => {
    let isCancelled = false;

    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const firestoreConfig = await getDeliveryFeeConfig();

        if (!isCancelled) {
          setConfig(firestoreConfig);
          setSavedConfig(firestoreConfig);
        }
      } catch (error) {
        console.error('Error fetching delivery fee config:', error);
        // Fall back to defaults on error
        if (!isCancelled) {
          setConfig(DEFAULT_CONFIG);
          setSavedConfig(DEFAULT_CONFIG);
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

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Local config setters (for testing, not persisted)
  const setBaseFee = useCallback((baseFee: number) => {
    setConfig((prev) => ({ ...prev, baseFee: Math.max(0, baseFee) }));
  }, []);

  const setMinFee = useCallback((minFee: number) => {
    setConfig((prev) => ({ ...prev, minFee: Math.max(0, minFee) }));
  }, []);

  const setMaxFee = useCallback((maxFee: number) => {
    setConfig((prev) => ({ ...prev, maxFee: Math.max(0, maxFee) }));
  }, []);

  // Tier operations (for testing, not persisted)
  const updateTier = useCallback((index: number, field: keyof DistanceTier, value: number) => {
    setConfig((prev) => {
      const newTiers = [...prev.tiers];
      newTiers[index] = { ...newTiers[index], [field]: value };
      return { ...prev, tiers: newTiers };
    });
  }, []);

  const addTier = useCallback(() => {
    setConfig((prev) => {
      const lastTier = prev.tiers[prev.tiers.length - 1];
      const newFromKm = lastTier ? lastTier.toKm : 0;
      const newTier: DistanceTier = {
        fromKm: newFromKm,
        toKm: newFromKm + 10,
        ratePerKm: 0.5,
      };
      return { ...prev, tiers: [...prev.tiers, newTier] };
    });
  }, []);

  const removeTier = useCallback((index: number) => {
    setConfig((prev) => {
      if (prev.tiers.length <= 1) return prev; // Keep at least one tier
      const newTiers = prev.tiers.filter((_, i) => i !== index);
      return { ...prev, tiers: newTiers };
    });
  }, []);

  // Reset local changes to saved Firestore values
  const resetToSaved = useCallback(() => {
    setConfig(savedConfig);
  }, [savedConfig]);

  return {
    config,
    isExpanded,
    toggleExpanded,
    isLoading,
    setBaseFee,
    setMinFee,
    setMaxFee,
    updateTier,
    addTier,
    removeTier,
    resetToSaved,
  };
}
