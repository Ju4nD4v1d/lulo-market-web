import type * as React from 'react';
/**
 * DeleteAccountModal - Account deletion confirmation modal
 */


import { Trash2 } from 'lucide-react';

interface DeleteAccountModalProps {
  show: boolean;
  password: string;
  error: string;
  isDeleting: boolean;
  onPasswordChange: (value: string) => void;
  onDelete: () => void;
  onClose: () => void;
  t: (key: string) => string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  show,
  password,
  error,
  isDeleting,
  onPasswordChange,
  onDelete,
  onClose,
  t
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('profile.deleteConfirmTitle')}</h3>
              <p className="text-sm text-gray-500">{t('profile.deleteConfirmSubtitle')}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              {t('profile.deleteConfirmMessage')}
            </p>

            <div className="mb-4">
              <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.deletePasswordLabel')}
              </label>
              <input
                id="deletePassword"
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('profile.deletePasswordPlaceholder')}
                autoComplete="current-password"
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base touch-manipulation"
              disabled={isDeleting}
            >
              {t('profile.cancel')}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting || !password}
              className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 text-base touch-manipulation ${
                isDeleting || !password
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isDeleting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>{t('profile.deleting')}</span>
                </div>
              ) : (
                t('profile.deleteAccountButton')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
