/**
 * Stage Configuration
 *
 * Centralized configuration for all store setup stages
 * Makes it easy to add/remove/reorder stages
 */

import { Store, MapPin, Phone, FileText, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface StageDefinition {
  id: number;
  key: string;
  titleKey: string;
  subtitleKey: string;
  icon: LucideIcon;
  gradient: {
    from: string;
    to: string;
  };
  iconGradient: {
    from: string;
    to: string;
  };
}

export const STAGES: StageDefinition[] = [
  {
    id: 1,
    key: 'basicInfo',
    titleKey: 'store.basicInfo',
    subtitleKey: 'store.basicInfoSubtitle',
    icon: Store,
    gradient: { from: 'primary-400/5', to: 'primary-500/5' },
    iconGradient: { from: 'primary-400', to: 'primary-500' },
  },
  {
    id: 2,
    key: 'address',
    titleKey: 'store.address.title',
    subtitleKey: 'store.address.subtitle',
    icon: MapPin,
    gradient: { from: 'teal-50', to: 'cyan-50' },
    iconGradient: { from: 'teal-500', to: 'cyan-500' },
  },
  {
    id: 3,
    key: 'contactInfo',
    titleKey: 'store.contactInfo',
    subtitleKey: 'store.contactInfoSubtitle',
    icon: Phone,
    gradient: { from: 'blue-50', to: 'cyan-50' },
    iconGradient: { from: 'blue-500', to: 'cyan-500' },
  },
  {
    id: 4,
    key: 'serviceAgreement',
    titleKey: 'store.agreement.title',
    subtitleKey: 'store.agreement.subtitle',
    icon: FileText,
    gradient: { from: 'amber-50', to: 'yellow-50' },
    iconGradient: { from: 'amber-500', to: 'yellow-500' },
  },
  {
    id: 5,
    key: 'pricingConfirmation',
    titleKey: 'store.pricing.title',
    subtitleKey: 'store.pricing.subtitle',
    icon: DollarSign,
    gradient: { from: 'green-50', to: 'emerald-50' },
    iconGradient: { from: 'green-500', to: 'emerald-500' },
  },
];

export const TOTAL_STAGES = STAGES.length;

export const getStageById = (id: number): StageDefinition | undefined => {
  return STAGES.find(stage => stage.id === id);
};

export const getStageByKey = (key: string): StageDefinition | undefined => {
  return STAGES.find(stage => stage.key === key);
};
