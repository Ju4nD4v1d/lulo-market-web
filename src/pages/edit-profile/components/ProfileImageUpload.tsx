import type * as React from 'react';
/**
 * ProfileImageUpload - Profile image upload and management component
 */


import { User, Camera, X } from 'lucide-react';

interface ProfileImageUploadProps {
  preview?: string;
  url?: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  t: (key: string) => string;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  preview,
  url,
  onImageChange,
  onRemoveImage,
}) => {
  const hasImage = !!(preview || url);

  return (
    <div className="relative group">
      {/* Profile Picture */}
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
        {hasImage ? (
          <img
            src={preview || url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
        )}
      </div>

      {/* Upload/Change Button - Desktop Hover */}
      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-opacity flex items-center justify-center touch-manipulation">
        <label className="cursor-pointer touch-manipulation">
          <input
            type="file"
            accept="image/*,image/heic,image/heif"
            capture="environment"
            onChange={onImageChange}
            className="sr-only"
          />
          <div className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center">
            <Camera className="w-4 h-4 text-gray-700" />
          </div>
        </label>
      </div>

      {/* Remove Image Button */}
      {hasImage && (
        <button
          onClick={onRemoveImage}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center touch-manipulation"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
