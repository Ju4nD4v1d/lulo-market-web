import type * as React from 'react';
/**
 * PasswordField - Reusable password input with show/hide toggle
 */


import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  showPassword: boolean;
  onToggleShow: () => void;
  helperText?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggleShow,
  helperText
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white/90 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-white/50" />
        </div>
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          data-auth-input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:ring-1 focus:ring-white/20"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-white/50 hover:text-white/80" />
          ) : (
            <Eye className="h-5 w-5 text-white/50 hover:text-white/80" />
          )}
        </button>
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-white/60">
          {helperText}
        </p>
      )}
    </div>
  );
};
