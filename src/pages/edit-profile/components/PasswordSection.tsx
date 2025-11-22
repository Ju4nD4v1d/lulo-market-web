import type * as React from 'react';
/**
 * PasswordSection - Password change fields
 */


import { Eye, EyeOff } from 'lucide-react';

interface PasswordSectionProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  errors: { [key: string]: string };
  onChange: (field: string, value: string) => void;
  onToggleShow: (field: 'current' | 'new' | 'confirm') => void;
  t: (key: string) => string;
}

export const PasswordSection: React.FC<PasswordSectionProps> = ({
  currentPassword,
  newPassword,
  confirmPassword,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  errors,
  onChange,
  onToggleShow,
  t
}) => {
  const renderPasswordField = (
    id: string,
    label: string,
    value: string,
    field: string,
    showPassword: boolean,
    toggleField: 'current' | 'new' | 'confirm',
    placeholder: string,
    autoComplete: string
  ) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className={`w-full pr-10 px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base ${
            errors[field] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => onToggleShow(toggleField)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-gray-400" />
          ) : (
            <Eye className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      {errors[field] && (
        <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="border-t border-gray-200 pt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {t('profile.changePassword')}
      </h3>
      <p className="text-sm text-gray-600">
        {t('profile.changePasswordDescription')}
      </p>

      {renderPasswordField(
        'currentPassword',
        t('profile.currentPassword'),
        currentPassword,
        'currentPassword',
        showCurrentPassword,
        'current',
        t('profile.currentPasswordPlaceholder'),
        'current-password'
      )}

      {renderPasswordField(
        'newPassword',
        t('profile.newPassword'),
        newPassword,
        'newPassword',
        showNewPassword,
        'new',
        t('profile.newPasswordPlaceholder'),
        'new-password'
      )}

      {renderPasswordField(
        'confirmPassword',
        t('profile.confirmPassword'),
        confirmPassword,
        'confirmPassword',
        showConfirmPassword,
        'confirm',
        t('profile.confirmPasswordPlaceholder'),
        'new-password'
      )}
    </div>
  );
};
