import type * as React from 'react';
/**
 * BasicInfoSection - Display name, email, phone fields
 *
 * Phone number is read-only (set during registration)
 */


import { User, Mail, Phone } from 'lucide-react';

interface BasicInfoSectionProps {
  displayName: string;
  email: string;
  phoneNumber: string;
  errors: { [key: string]: string };
  onChange: (field: string, value: string) => void;
  t: (key: string) => string;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  displayName,
  email,
  phoneNumber,
  errors,
  onChange,
  t
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <User className="w-5 h-5" />
        {t('profile.basicInfo')}
      </h3>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.displayName')}
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => onChange('displayName', e.target.value)}
          className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base ${
            errors.displayName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('profile.displayNamePlaceholder')}
          autoComplete="name"
        />
        {errors.displayName && (
          <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.email')}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('profile.emailPlaceholder')}
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone Number - Read-only (set during registration) */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.phoneNumber')}
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber || ''}
            readOnly
            className="w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-50 text-gray-500 text-base border-gray-300 cursor-default"
            placeholder={phoneNumber ? '' : '-'}
          />
        </div>
      </div>
    </div>
  );
};
