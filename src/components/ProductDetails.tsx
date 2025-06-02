import React, { useState } from 'react';
import { ArrowLeft, Package, DollarSign, Tag, Box, Clock, Save, X, Upload, Trash2, ImageIcon, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    status: 'active' | 'draft' | 'outOfStock';
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    storeId: string;
  };
  onBack: () => void;
  onEdit: () => void;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export const ProductDetails = ({ product, onBack }: ProductDetailsProps) => {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    stock: product.stock,
    status: product.status
  });

  // Separate state for managing images
  const [existingImages, setExistingImages] = useState<string[]>(product.images);
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      // Delete removed images from storage
      await Promise.all(
        removedImages.map(async (imageUrl) => {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        })
      );

      // Upload new images
      const uploadedImageUrls = await Promise.all(
        newImages.map(async ({ file }) => {
          const imageRef = ref(storage, `stores/${product.storeId}/products/${Date.now()}_${file.name}`);
          await uploadBytes(imageRef, file);
          return getDownloadURL(imageRef);
        })
      );

      // Combine existing and new image URLs
      const finalImages = [
        ...existingImages.filter(url => !removedImages.includes(url)),
        ...uploadedImageUrls
      ];

      // Update product in Firestore
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        ...formData,
        images: finalImages,
        updatedAt: new Date()
      });

      // Reset image states
      setNewImages([]);
      setRemovedImages([]);
      setExistingImages(finalImages);

    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      status: product.status
    });
    setExistingImages(product.images);
    setNewImages([]);
    setRemovedImages([]);
    setError('');
  };

  const validateAndProcessFiles = (files: FileList | null) => {
    if (!files) return;

    const totalImages = existingImages.length + newImages.length;
    const newFiles: { file: File; preview: string }[] = [];
    let errorMessage = '';

    Array.from(files).forEach(file => {
      if (totalImages + newFiles.length >= MAX_IMAGES) {
        errorMessage = `Maximum ${MAX_IMAGES} images allowed`;
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errorMessage = 'One or more images exceed 1MB size limit';
        return;
      }

      if (!file.type.startsWith('image/')) {
        errorMessage = 'Only image files are allowed';
        return;
      }

      newFiles.push({
        file,
        preview: URL.createObjectURL(file)
      });
    });

    if (newFiles.length > 0) {
      setNewImages(prev => [...prev, ...newFiles]);
      setError('');
    } else if (errorMessage) {
      setError(errorMessage);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    validateAndProcessFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndProcessFiles(e.target.files);
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const imageUrl = existingImages[index];
      setRemovedImages(prev => [...prev, imageUrl]);
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const imageToRemove = newImages[index];
      URL.revokeObjectURL(imageToRemove.preview);
      setNewImages(prev => prev.filter((_, i) => i !== index));
    }
    setError('');
  };

  // Combine existing and new images for display
  const allImages = [
    ...existingImages.map(url => ({ url, isExisting: true })),
    ...newImages.map(({ preview }) => ({ url: preview, isExisting: false }))
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </button>
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 
              border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-primary-600
              rounded-lg hover:bg-primary-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg text-red-600 text-sm flex items-center">
              <X className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <div
                key={index}
                className={`
                  relative rounded-lg overflow-hidden
                  ${index === 0 ? 'col-span-2 row-span-2' : ''}
                  group
                `}
              >
                <img
                  src={image.url}
                  alt={`${formData.name} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: '1 / 1' }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity 
                  flex items-center justify-center">
                  <button
                    onClick={() => removeImage(index, image.isExisting)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    Main Image
                  </span>
                )}
              </div>
            ))}
            
            {allImages.length < MAX_IMAGES && (
              <div
                className={`
                  aspect-square border-2 border-dashed rounded-lg
                  flex flex-col items-center justify-center cursor-pointer
                  ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
                  hover:border-primary-400 transition-colors duration-200
                  group
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
                <div className="text-center mt-2">
                  <label className="cursor-pointer">
                    <span className="text-sm text-primary-600 hover:text-primary-500">Upload</span>
                    <input
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    or drag and drop
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="text-2xl font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-primary-500 px-1"
            />
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium
                ${formData.status === 'active' ? 'bg-green-100 text-green-800' :
                  formData.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'}
              `}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Add a description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-primary-500 px-1"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Tag className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-primary-500 px-1"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Box className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock</p>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      className="font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-primary-500 px-1"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Modified</span>
                  <span className="text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`
                    px-2 py-1 rounded-full text-sm font-medium
                    ${formData.status === 'active' ? 'bg-green-100 text-green-800' :
                      formData.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'}
                  `}>
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Images</span>
                  <span className="text-gray-900">{allImages.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};