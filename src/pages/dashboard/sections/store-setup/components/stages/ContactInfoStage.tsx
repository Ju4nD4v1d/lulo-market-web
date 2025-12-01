/**
 * ContactInfoStage Component
 *
 * Stage 3: Contact Information
 * Collects phone, email, website, and delivery hours
 */

import type * as React from 'react';
import { useMemo } from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Package } from 'lucide-react';
import { useLanguage } from '../../../../../../context/LanguageContext';
import { theme } from '../../../../../../config/theme';

interface DeliveryHours {
  [day: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

// Canonical day order (Monday first, then through Sunday)
const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Map various day name formats to canonical names for sorting
const DAY_NAME_MAP: Record<string, string> = {
  // English
  sunday: 'Sunday', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday',
  // Spanish
  domingo: 'Sunday', lunes: 'Monday', martes: 'Tuesday', miércoles: 'Wednesday',
  miercoles: 'Wednesday', jueves: 'Thursday', viernes: 'Friday', sábado: 'Saturday', sabado: 'Saturday',
};

/**
 * Normalize day name to canonical English format
 */
function normalizeDay(day: string): string {
  const lowered = day.toLowerCase().trim();
  return DAY_NAME_MAP[lowered] || day;
}

interface ContactInfoStageProps {
  phone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  deliveryHours: DeliveryHours;
  lowStockThreshold: number;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onInstagramChange: (value: string) => void;
  onFacebookChange: (value: string) => void;
  onDeliveryHoursChange: (hours: DeliveryHours) => void;
  onLowStockThresholdChange: (value: number) => void;
}

export const ContactInfoStage: React.FC<ContactInfoStageProps> = ({
  phone,
  email,
  website,
  instagram,
  facebook,
  deliveryHours,
  lowStockThreshold,
  onPhoneChange,
  onEmailChange,
  onWebsiteChange,
  onInstagramChange,
  onFacebookChange,
  onDeliveryHoursChange,
  onLowStockThresholdChange,
}) => {
  const { t } = useLanguage();

  // Sort delivery hours by day of week (Monday first)
  const sortedDeliveryHours = useMemo(() => {
    return Object.entries(deliveryHours).sort(([dayA], [dayB]) => {
      const normalizedA = normalizeDay(dayA);
      const normalizedB = normalizeDay(dayB);
      const indexA = DAY_ORDER.indexOf(normalizedA);
      const indexB = DAY_ORDER.indexOf(normalizedB);
      // If not found in DAY_ORDER, put at end
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }, [deliveryHours]);

  const handleDayToggle = (day: string, checked: boolean) => {
    const updatedHours = {
      ...deliveryHours,
      [day]: { ...deliveryHours[day], closed: !checked }
    };
    onDeliveryHoursChange(updatedHours);
  };

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    const updatedHours = {
      ...deliveryHours,
      [day]: { ...deliveryHours[day], [field]: value }
    };
    onDeliveryHoursChange(updatedHours);
  };

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

      {/* Delivery Hours */}
      <div className="group">
        <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-400" />
          {t('store.deliveryHours')}
        </label>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          {sortedDeliveryHours.map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-700">
                {t(`day.${normalizeDay(day).toLowerCase()}`)}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!hours.closed}
                  onChange={(e) => handleDayToggle(day, e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  style={{ accentColor: theme.colors.primary400 }}
                />
                <span className="text-sm text-gray-600 w-12">{t('store.open')}</span>
              </div>
              {!hours.closed && (
                <>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-colors"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-colors"
                  />
                </>
              )}
              {hours.closed && (
                <span className="text-red-600 text-sm font-medium">{t('store.closed')}</span>
              )}
            </div>
          ))}
        </div>
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
