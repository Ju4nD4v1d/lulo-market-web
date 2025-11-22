import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Save, AlertCircle, CheckCircle2, Eye, EyeOff, Camera, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfileMutations } from '../hooks/mutations/useProfileMutations';
import { UserProfile } from '../types/user';

// Helper function to get friendly error messages
const getFirebaseErrorMessage = (errorCode: string, t: (key: string) => string): string => {
  const errorMappings: { [key: string]: string } = {
    'auth/invalid-credential': 'auth.error.invalidCredential',
    'auth/wrong-password': 'auth.error.wrongPassword',
    'auth/email-already-in-use': 'auth.error.emailAlreadyInUse',
    'auth/invalid-email': 'auth.error.invalidEmail',
    'auth/weak-password': 'auth.error.weakPassword',
    'auth/requires-recent-login': 'auth.error.requiresRecentLogin',
    'auth/user-not-found': 'auth.error.userNotFound',
    'auth/too-many-requests': 'auth.error.tooManyRequests',
    'auth/network-request-failed': 'auth.error.networkError'
  };
  
  const messageKey = errorMappings[errorCode] || 'auth.error.default';
  return t(messageKey);
};

export const EditProfile = () => {
  const { currentUser, userProfile, updateProfile, refreshUserProfile } = useAuth();
  const { t } = useLanguage();
  const { uploadAvatar, deleteAvatar, deleteAccount } = useProfileMutations(currentUser?.uid || '');

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<{
    file?: File;
    preview?: string;
    url?: string;
  }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize form data with current user profile
  // Only sync when user ID changes to prevent infinite loops
  useEffect(() => {
    if (userProfile && currentUser) {
      setFormData({
        displayName: userProfile.displayName || '',
        email: currentUser.email || '',
        phoneNumber: userProfile.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Initialize profile image
      if (userProfile.avatar) {
        setProfileImage({ url: userProfile.avatar });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]); // Only depend on uid, not the full objects

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Display name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = t('profile.error.displayNameRequired');
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = t('profile.error.displayNameMinLength');
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('profile.error.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('profile.error.emailInvalid');
    }

    // Phone number validation (optional but format check)
    if (formData.phoneNumber && !/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = t('profile.error.phoneInvalid');
    }

    // Password validation (only if changing password)
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = t('profile.error.currentPasswordRequired');
      }
      
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = t('profile.error.newPasswordMinLength');
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = t('profile.error.passwordsDoNotMatch');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear success message when user starts editing
    if (success) {
      setSuccess('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      let avatarUrl = userProfile?.avatar;

      // Handle profile image upload
      if (profileImage.file) {
        avatarUrl = await uploadProfileImage();
      } else if (profileImage.url === undefined && userProfile?.avatar) {
        // User removed their profile image
        await deleteProfileImage();
        avatarUrl = undefined;
      }

      // Prepare update data - filter out undefined values for Firestore compatibility
      const updateData: Partial<UserProfile> = {};
      
      updateData.displayName = formData.displayName.trim();
      
      if (formData.phoneNumber.trim()) {
        updateData.phoneNumber = formData.phoneNumber.trim();
      }
      
      if (avatarUrl !== undefined) {
        updateData.avatar = avatarUrl;
      }

      // Update profile
      
      // Prepare auth update data - only include defined values
      const authUpdateData: { email?: string; currentPassword?: string; newPassword?: string } = {};
      
      if (formData.email !== currentUser?.email) {
        authUpdateData.email = formData.email;
      }
      
      if (formData.currentPassword) {
        authUpdateData.currentPassword = formData.currentPassword;
      }
      
      if (formData.newPassword) {
        authUpdateData.newPassword = formData.newPassword;
      }
      
      
      // Only pass authUpdateData if it has properties
      const hasAuthUpdates = Object.keys(authUpdateData).length > 0;
      await updateProfile(updateData, hasAuthUpdates ? authUpdateData : undefined);

      setSuccess(t('profile.profileUpdated'));
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Refresh profile to ensure UI shows latest data including avatar
      try {
        await refreshUserProfile();
        // Emit custom event to notify other components about profile update
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } catch (error) {
        console.error('Error refreshing profile after update:', error);
        // Don't fail the whole operation if refresh fails
      }

    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Error updating profile:', error);
      
      // Use friendly error message based on Firebase error code
      const friendlyMessage = err.code ? getFirebaseErrorMessage(err.code, t) : t('profile.error.profileUpdateFailed');
      setErrors({ 
        general: friendlyMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    try {
      // Refresh user profile to ensure latest data is loaded
      await refreshUserProfile();
      // Emit custom event to notify other components about profile update
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (error) {
      console.error('Error refreshing profile on back navigation:', error);
      // Continue with navigation even if refresh fails
    }
    
    // Check if there's a stored back navigation path, otherwise use browser back
    const backPath = localStorage.getItem('backNavigationPath');
    if (backPath && backPath !== window.location.hash) {
      localStorage.removeItem('backNavigationPath');
      window.location.hash = backPath;
    } else {
      window.history.back();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageValidation(file);
    }
    // Clear the input value to allow selecting the same file again (mobile behavior)
    e.target.value = '';
  };

  const handleImageValidation = (file: File) => {
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ profileImage: t('profile.error.imageSize') });
      return;
    }

    // Enhanced file type checking for mobile compatibility
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
      setErrors({ profileImage: t('profile.error.imageType') });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage({
        file,
        preview: e.target?.result as string
      });
      // Clear any previous errors
      setErrors(prev => ({ ...prev, profileImage: '' }));
    };
    
    // Handle potential FileReader errors on mobile
    reader.onerror = () => {
      setErrors({ profileImage: t('profile.error.imageReadFailed') });
    };
    
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage({});
    // Clear any errors
    setErrors(prev => ({ ...prev, profileImage: '' }));
  };

  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileImage.file || !currentUser) return null;

    try {
      const downloadURL = await uploadAvatar.mutateAsync(profileImage.file);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error(t('profile.error.imageUploadFailed'));
    }
  };

  const deleteProfileImage = async () => {
    if (!userProfile?.avatar || !currentUser) return;

    try {
      await deleteAvatar.mutateAsync();
    } catch {
      // Image might not exist, that's okay
      console.log('Profile image not found in storage, continuing...');
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser || !deletePassword) return;

    setIsDeleting(true);
    try {
      await deleteAccount.mutateAsync({
        password: deletePassword,
        hasAvatar: !!userProfile?.avatar
      });

      // Redirect to landing page
      window.location.hash = '#';
      window.location.reload();
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Error deleting account:', err);
      
      // Handle specific Firebase errors with friendly messages
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrors({ deletePassword: getFirebaseErrorMessage(err.code, t) });
      } else if (err.code === 'auth/requires-recent-login') {
        setErrors({ deletePassword: getFirebaseErrorMessage(err.code, t) });
      } else {
        const friendlyMessage = err.code ? getFirebaseErrorMessage(err.code, t) : t('auth.error.default');
        setErrors({ 
          general: friendlyMessage
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="text-gray-600">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('profile.back')}</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t('profile.editProfile')}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-6">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                  {profileImage.preview || profileImage.url ? (
                    <img
                      src={profileImage.preview || profileImage.url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Upload/Change Button - Mobile Optimized */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-opacity flex items-center justify-center touch-manipulation">
                  <label className="cursor-pointer touch-manipulation">
                    <input
                      type="file"
                      accept="image/*,image/heic,image/heif"
                      capture="environment"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                    <div className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center">
                      <Camera className="w-4 h-4 text-gray-700" />
                    </div>
                  </label>
                </div>
                
                {/* Remove Image Button */}
                {(profileImage.preview || profileImage.url) && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center touch-manipulation"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {userProfile.displayName || 'User'}
                </h2>
                <p className="text-gray-500">{currentUser.email}</p>
                <p className="text-sm text-gray-400">
                  {t('profile.memberSince')} {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
                
                {/* Mobile-Friendly Upload Button */}
                <div className="mt-4 md:hidden">
                  <label className="inline-flex items-center gap-2 bg-primary-400 text-gray-800 px-4 py-2 rounded-lg font-medium cursor-pointer touch-manipulation hover:bg-primary-500 transition-colors">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">
                      {profileImage.preview || profileImage.url ? t('profile.changePhoto') : t('profile.addPhoto')}
                    </span>
                    <input
                      type="file"
                      accept="image/*,image/heic,image/heif"
                      capture="environment"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                
                {/* Image Upload Instructions */}
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    <span className="hidden md:inline">{t('profile.uploadInstructions')}</span>
                    <span className="md:hidden">{t('profile.uploadInstructionsMobile')}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('profile.uploadFormats')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Image Error */}
            {errors.profileImage && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-700">{errors.profileImage}</p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-red-50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Basic Information */}
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
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
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
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.phoneNumber')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('profile.phoneNumberPlaceholder')}
                    autoComplete="tel"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* Password Change Section */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('profile.changePassword')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('profile.changePasswordDescription')}
              </p>

              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className={`w-full pr-10 px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base ${
                      errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('profile.currentPasswordPlaceholder')}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.newPassword')}
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className={`w-full pr-10 px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('profile.newPasswordPlaceholder')}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pr-10 px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('profile.confirmPasswordPlaceholder')}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Danger Zone - Delete Account */}
            <div className="border-t border-red-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {t('profile.dangerZone')}
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">{t('profile.deleteAccount')}</h4>
                <p className="text-sm text-red-700 mb-4">
                  {t('profile.deleteAccountDescription')}
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors text-base font-medium touch-manipulation"
                >
                  {t('profile.deleteMyAccount')}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-lg font-medium transition-all duration-200 text-base touch-manipulation ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-400 to-primary-500 hover:shadow-lg transform hover:scale-[1.02]'
                } text-white`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isLoading ? t('profile.saving') : t('profile.saveChanges')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Account Confirmation Modal - Mobile Optimized */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
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
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      // Clear error when user starts typing
                      if (errors.deletePassword) {
                        setErrors(prev => ({ ...prev, deletePassword: '' }));
                      }
                    }}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base ${
                      errors.deletePassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('profile.deletePasswordPlaceholder')}
                    autoComplete="current-password"
                  />
                  {errors.deletePassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.deletePassword}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                    setErrors(prev => ({ ...prev, deletePassword: '' }));
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base touch-manipulation"
                  disabled={isDeleting}
                >
                  {t('profile.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !deletePassword}
                  className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 text-base touch-manipulation ${
                    isDeleting || !deletePassword
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
      )}
    </div>
  );
};export default EditProfile;
