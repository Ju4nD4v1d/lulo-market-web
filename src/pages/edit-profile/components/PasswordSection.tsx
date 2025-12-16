import type * as React from 'react';
/**
 * PasswordSection - Password change fields
 * Uses the shared PasswordField component from login-page
 */

import { PasswordField } from '../../login-page/components/PasswordField';

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
  return (
    <div className="border-t border-white/10 pt-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">
        {t('profile.changePassword')}
      </h3>
      <p className="text-sm text-white/60">
        {t('profile.changePasswordDescription')}
      </p>

      <PasswordField
        id="currentPassword"
        label={t('profile.currentPassword')}
        value={currentPassword}
        onChange={(value) => onChange('currentPassword', value)}
        placeholder={t('profile.currentPasswordPlaceholder')}
        showPassword={showCurrentPassword}
        onToggleShow={() => onToggleShow('current')}
      />
      {errors.currentPassword && (
        <p className="mt-1 text-sm text-red-400">{errors.currentPassword}</p>
      )}

      <PasswordField
        id="newPassword"
        label={t('profile.newPassword')}
        value={newPassword}
        onChange={(value) => onChange('newPassword', value)}
        placeholder={t('profile.newPasswordPlaceholder')}
        showPassword={showNewPassword}
        onToggleShow={() => onToggleShow('new')}
      />
      {errors.newPassword && (
        <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>
      )}

      <PasswordField
        id="confirmPassword"
        label={t('profile.confirmPassword')}
        value={confirmPassword}
        onChange={(value) => onChange('confirmPassword', value)}
        placeholder={t('profile.confirmPasswordPlaceholder')}
        showPassword={showConfirmPassword}
        onToggleShow={() => onToggleShow('confirm')}
      />
      {errors.confirmPassword && (
        <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
      )}
    </div>
  );
};
