/**
 * Hook for managing Delivery Fee Simulator state
 * Persists configuration to localStorage for admin convenience
 */

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CONFIG, STORAGE_KEY } from '../../../../../services/delivery/constants';
import type { DeliveryFeeConfig, DistanceTier } from '../../../../../services/delivery/types';

export function useDeliveryFeeSimulator() {
  const [config, setConfig] = useState<DeliveryFeeConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load saved delivery fee config:', error);
    }
    return DEFAULT_CONFIG;
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save delivery fee config:', error);
    }
  }, [config]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, enabled }));
  }, []);

  const setBaseFee = useCallback((baseFee: number) => {
    setConfig(prev => ({ ...prev, baseFee: Math.max(0, baseFee) }));
  }, []);

  const setMinFee = useCallback((minFee: number) => {
    setConfig(prev => ({ ...prev, minFee: Math.max(0, minFee) }));
  }, []);

  const setMaxFee = useCallback((maxFee: number) => {
    setConfig(prev => ({ ...prev, maxFee: Math.max(0, maxFee) }));
  }, []);

  const setTiers = useCallback((tiers: DistanceTier[]) => {
    setConfig(prev => ({ ...prev, tiers }));
  }, []);

  const updateTier = useCallback((index: number, field: keyof DistanceTier, value: number) => {
    setConfig(prev => {
      const newTiers = [...prev.tiers];
      newTiers[index] = { ...newTiers[index], [field]: value };
      return { ...prev, tiers: newTiers };
    });
  }, []);

  const addTier = useCallback(() => {
    setConfig(prev => {
      const lastTier = prev.tiers[prev.tiers.length - 1];
      const newFromKm = lastTier ? lastTier.toKm : 0;
      const newTier: DistanceTier = {
        fromKm: newFromKm,
        toKm: newFromKm + 10,
        ratePerKm: 0.50,
      };
      return { ...prev, tiers: [...prev.tiers, newTier] };
    });
  }, []);

  const removeTier = useCallback((index: number) => {
    setConfig(prev => {
      if (prev.tiers.length <= 1) return prev; // Keep at least one tier
      const newTiers = prev.tiers.filter((_, i) => i !== index);
      return { ...prev, tiers: newTiers };
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  return {
    config,
    isExpanded,
    toggleExpanded,
    setEnabled,
    setBaseFee,
    setMinFee,
    setMaxFee,
    setTiers,
    updateTier,
    addTier,
    removeTier,
    resetToDefaults,
  };
}
