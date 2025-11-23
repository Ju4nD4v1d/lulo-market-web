/**
 * ContactInfoStage Component
 *
 * Stage 3: Contact Information
 * Collects phone, email, website, and delivery hours
 */

import type * as React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../../../../../../context/LanguageContext';
import { theme } from '../../../../../../config/theme';

interface DeliveryHours {
  [day: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

interface ContactInfoStageProps {
  phone: string;
  email: string;
  website: string;
  deliveryHours: DeliveryHours;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onDeliveryHoursChange: (hours: DeliveryHours) => void;
}

export const ContactInfoStage: React.FC<ContactInfoStageProps> = ({
  phone,
  email,
  website,
  deliveryHours,
  onPhoneChange,
  onEmailChange,
  onWebsiteChange,
  onDeliveryHoursChange,
}) => {
  const { t } = useLanguage();

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

      {/* Delivery Hours */}
      <div className="group">
        <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-400" />
          {t('store.deliveryHours')}
        </label>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          {Object.entries(deliveryHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-700">
                {t(`day.${day.toLowerCase()}`)}
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
    </div>
  );
};
