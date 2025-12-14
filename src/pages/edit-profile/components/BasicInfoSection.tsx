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
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <User className="w-5 h-5 text-white/70" />
        {t('profile.basicInfo')}
      </h3>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-white/90 mb-1">
          {t('profile.displayName')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-white/50" />
          </div>
          <input
            id="displayName"
            type="text"
            data-auth-input
            value={displayName}
            onChange={(e) => onChange('displayName', e.target.value)}
            className={`w-full pl-10 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:ring-1 focus:ring-white/20 ${
              errors.displayName ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder={t('profile.displayNamePlaceholder')}
            autoComplete="name"
          />
        </div>
        {errors.displayName && (
          <p className="mt-1 text-sm text-red-400">{errors.displayName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
          {t('profile.email')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-white/50" />
          </div>
          <input
            id="email"
            type="email"
            data-auth-input
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full pl-10 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:ring-1 focus:ring-white/20 ${
              errors.email ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder={t('profile.emailPlaceholder')}
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Phone Number - Read-only (set during registration) */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-white/90 mb-1">
          {t('profile.phoneNumber')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-white/50" />
          </div>
          <input
            id="phoneNumber"
            type="tel"
            data-auth-input
            value={phoneNumber || ''}
            readOnly
            className="w-full pl-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 cursor-default"
            placeholder={phoneNumber ? '' : '-'}
          />
        </div>
      </div>
    </div>
  );
};
