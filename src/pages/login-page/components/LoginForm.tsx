import type * as React from 'react';
/**
 * LoginForm - Login-specific form fields
 */


import { Mail } from 'lucide-react';
import { PasswordField } from './PasswordField';

interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  clearMessages: () => void;
  t: (key: string) => string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  clearMessages,
  t
}) => {
  return (
    <>
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
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 border-gray-300 rounded text-primary-400 focus:ring-primary-400"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            {t('auth.rememberMe')}
          </label>
        </div>
        <a href="#forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          {t('auth.forgotPassword')}
        </a>
      </div>
    </>
  );
};
