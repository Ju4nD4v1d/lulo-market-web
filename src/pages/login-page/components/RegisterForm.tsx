import type * as React from 'react';
/**
 * RegisterForm - Registration-specific form fields
 */


import { Mail, User } from 'lucide-react';
import { PasswordField } from './PasswordField';

interface RegisterFormProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  clearMessages: () => void;
  t: (key: string) => string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  clearMessages,
  t
}) => {
  return (
    <>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.fullName')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              clearMessages();
            }}
            className="w-full pl-10 border border-gray-300 rounded-lg"
            placeholder={t('auth.fullNamePlaceholder')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.email')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearMessages();
            }}
            className="w-full pl-10 border border-gray-300 rounded-lg"
            placeholder={t('auth.emailPlaceholder')}
          />
        </div>
      </div>

      <PasswordField
        id="password"
        label={t('auth.password')}
        value={password}
        onChange={(value) => {
          setPassword(value);
          clearMessages();
        }}
        placeholder={t('auth.passwordPlaceholder')}
        showPassword={showPassword}
        onToggleShow={() => setShowPassword(!showPassword)}
        helperText={t('auth.errors.passwordTooShort')}
      />

      <PasswordField
        id="confirmPassword"
        label={t('profile.confirmPassword')}
        value={confirmPassword}
        onChange={(value) => {
          setConfirmPassword(value);
          clearMessages();
        }}
        placeholder={t('auth.confirmPasswordPlaceholder')}
        showPassword={showConfirmPassword}
        onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
      />
    </>
  );
};
