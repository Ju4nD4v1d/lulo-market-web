import type * as React from 'react';
/**
 * EditProfilePage - User profile editing page
 */


import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useEditProfileForm } from './hooks/useEditProfileForm';
import { useProfileImage } from './hooks/useProfileImage';
import { useDeleteAccount } from './hooks/useDeleteAccount';
import {
  ProfileImageUpload,
  BasicInfoSection,
  AddressSection,
  PasswordSection,
  DeleteAccountModal
} from './components';

export const EditProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const {
    formData,
    errors,
    success,
    isLoading,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    handleFieldChange,
    handlePasswordToggle,
    handleSubmit,
    clearError,
    setFieldError
  } = useEditProfileForm({ t });

  const {
    profileImage,
    handleImageChange,
    handleRemoveImage
  } = useProfileImage({
    initialUrl: userProfile?.avatar,
    t,
    onError: setFieldError,
    clearError
  });

  const {
    showDeleteConfirm,
    setShowDeleteConfirm,
    deletePassword,
    handlePasswordChange,
    isDeleting,
    deleteSuccess,
    handleDeleteAccount,
    closeDeleteModal
  } = useDeleteAccount({
    t,
    onError: setFieldError,
    clearError
  });

  // Initialize form data from user profile
  // This is handled in useEditProfileForm hook, no need to duplicate here
  // Removed to avoid dependency issues and infinite loops

  const handleFormSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e, profileImage);
  };

  const handleBack = () => {
    const from = localStorage.getItem('editProfileFrom');
    if (from) {
      localStorage.removeItem('editProfileFrom');
      navigate(from);
    } else {
      navigate('/');
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('profile.back')}</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('profile.editProfile')}</h1>
          <p className="text-gray-600 mt-1">{t('profile.editProfileDescription')}</p>
        </div>

        {/* Profile Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center pb-6 border-b border-gray-200">
              <ProfileImageUpload
                preview={profileImage.preview}
                url={profileImage.url}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
                t={t}
              />
              {errors.profileImage && (
                <p className="mt-2 text-sm text-red-600">{errors.profileImage}</p>
              )}
            </div>

            {/* Basic Info Section */}
            <BasicInfoSection
              displayName={formData.displayName}
              email={formData.email}
              phoneNumber={formData.phoneNumber}
              errors={errors}
              onChange={handleFieldChange}
              t={t}
            />

            {/* Address Section */}
            <AddressSection
              street={formData.street}
              city={formData.city}
              province={formData.province}
              postalCode={formData.postalCode}
              errors={errors}
              onChange={handleFieldChange}
              t={t}
            />

            {/* Password Section */}
            <PasswordSection
              currentPassword={formData.currentPassword}
              newPassword={formData.newPassword}
              confirmPassword={formData.confirmPassword}
              showCurrentPassword={showCurrentPassword}
              showNewPassword={showNewPassword}
              showConfirmPassword={showConfirmPassword}
              errors={errors}
              onChange={handleFieldChange}
              onToggleShow={handlePasswordToggle}
              t={t}
            />

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 text-base touch-manipulation ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>{t('profile.saving')}</span>
                  </div>
                ) : (
                  t('profile.saveChanges')
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 mt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{t('profile.dangerZone')}</h3>
              <p className="text-sm text-gray-600 mt-1">{t('profile.deleteAccountDescription')}</p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-4 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm touch-manipulation"
              >
                {t('profile.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        show={showDeleteConfirm}
        password={deletePassword}
        error={errors.deletePassword || ''}
        isDeleting={isDeleting}
        deleteSuccess={deleteSuccess}
        onPasswordChange={handlePasswordChange}
        onDelete={handleDeleteAccount}
        onClose={closeDeleteModal}
        t={t}
      />
    </div>
  );
};

export default EditProfilePage;
