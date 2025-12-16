import type * as React from 'react';
/**
 * LoginForm - Login-specific form fields
 */


import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
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
        <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
          {t('auth.email')}
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
            onChange={(e) => {
              setEmail(e.target.value);
              clearMessages();
            }}
            className="w-full pl-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:ring-1 focus:ring-white/20"
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
            className="h-4 w-4 border-white/30 rounded text-primary-400 focus:ring-primary-400 bg-white/10"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-white/80">
            {t('auth.rememberMe')}
          </label>
        </div>
        <Link to="/forgot-password" className="text-sm font-medium text-white/80 hover:text-white underline">
          {t('auth.forgotPassword')}
        </Link>
      </div>
    </>
  );
};
