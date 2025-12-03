/**
 * ContactInfoStage Component
 *
 * Stage 3: Contact Information
 * Collects phone, email, website, and delivery schedule (multi-slot)
 */

import type * as React from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Package, Clock } from 'lucide-react';
import { useLanguage } from '../../../../../../context/LanguageContext';
import { MultiSlotSchedule } from '../../../../../../types/schedule';
import { MultiSlotScheduleEditor } from '../../../../../../components/MultiSlotScheduleEditor';

interface ContactInfoStageProps {
  phone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  deliverySchedule: MultiSlotSchedule;
  lowStockThreshold: number;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onInstagramChange: (value: string) => void;
  onFacebookChange: (value: string) => void;
  onDeliveryScheduleChange: (schedule: MultiSlotSchedule) => void;
  onLowStockThresholdChange: (value: number) => void;
}

export const ContactInfoStage: React.FC<ContactInfoStageProps> = ({
  phone,
  email,
  website,
  instagram,
  facebook,
  deliverySchedule,
  lowStockThreshold,
  onPhoneChange,
  onEmailChange,
  onWebsiteChange,
  onInstagramChange,
  onFacebookChange,
  onDeliveryScheduleChange,
  onLowStockThresholdChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary-400" />
            {t('store.phone')}
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300"
              placeholder={t('store.phonePlaceholder')}
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary-400" />
            {t('store.email')}
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300"
              placeholder={t('store.emailPlaceholder')}
            />
          </div>
        </div>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-500" />
          {t('store.website')}
        </label>
        <div className="relative">
          <input
            type="url"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300"
            placeholder={t('store.websitePlaceholder')}
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Instagram className="w-4 h-4" style={{ color: '#E4405F' }} />
            {t('store.instagram')}
            <span className="text-gray-400 text-xs font-normal">({t('common.optional')})</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={instagram}
              onChange={(e) => onInstagramChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-400/20 focus:border-pink-400 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300"
              placeholder={t('store.instagramPlaceholder')}
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Facebook className="w-4 h-4 text-blue-600" />
            {t('store.facebook')}
            <span className="text-gray-400 text-xs font-normal">({t('common.optional')})</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={facebook}
              onChange={(e) => onFacebookChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300"
              placeholder={t('store.facebookPlaceholder')}
            />
          </div>
        </div>
      </div>

      {/* Delivery Schedule (Multi-Slot) */}
      <div className="group">
        <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-400" />
          {t('store.deliveryHours')}
        </label>
        <MultiSlotScheduleEditor
          schedule={deliverySchedule}
          onChange={onDeliveryScheduleChange}
        />
      </div>

      {/* Low Stock Threshold */}
      <div className="group">
        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-500" />
          {t('inventory.threshold')}
          <span className="text-gray-400 text-xs font-normal">({t('common.optional')})</span>
        </label>
        <p className="text-sm text-gray-500 mb-3">
          {t('inventory.thresholdDescription')}
        </p>
        <div className="relative max-w-xs">
          <input
            type="number"
            min="1"
            max="100"
            value={lowStockThreshold}
            onChange={(e) => onLowStockThresholdChange(parseInt(e.target.value) || 10)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300"
            placeholder="10"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {t('products.units')}
          </span>
        </div>
      </div>
    </div>
  );
};
