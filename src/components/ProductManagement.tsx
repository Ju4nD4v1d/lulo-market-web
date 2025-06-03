import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Grid,
  List,
  X,
  Upload,
  DollarSign,
  Tag,
  Boxes,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Eye,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Edit,
  Flame,
  Snowflake,
  Cookie,
  Coffee
} from 'lucide-react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { ProductDetails } from './ProductDetails';

interface Product {
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
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  product?: Product;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    status: 'active',
    images: []
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
      });
      setImagePreviews(product.images || []);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        stock: 0,
        status: 'active',
        images: []
      });
      setImageFiles([]);
      setImagePreviews([]);
    }
  }, [product]);

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
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    setError('');
    
    // Filter valid image files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload only image files.');
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('File size should not exceed 5MB.');
        return false;
      }
      return true;
    });

    // Check total number of images
    if (imageFiles.length + validFiles.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    // Create previews for valid files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Upload images if any
      const imageUrls = [...(formData.images || [])];
      
      for (const file of imageFiles) {
        const imageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      await onSave({
        ...formData,
        images: imageUrls
      });

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images ({imagePreviews.length}/{MAX_IMAGES})
            </label>
            <div
              className={`
                border-2 border-dashed rounded-lg p-8
                ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
                hover:border-primary-400 transition-colors duration-200
                text-center cursor-pointer relative
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < MAX_IMAGES && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center aspect-square">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm text-gray-600 justify-center">
                    <p className="text-primary-600 font-medium">
                      Click to upload
                    </p>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full"
                required
              >
                <option value="">Select category</option>
                <option value="hot">Hot</option>
                <option value="frozen">Frozen</option>
                <option value="baked">Baked</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="pl-10 w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex space-x-4">
              {['active', 'draft', 'outOfStock'].map((status) => (
                <label key={status} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={status}
                    checked={formData.status === status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="form-radio text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {status === 'outOfStock' ? 'Out of Stock' : status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>{product ? 'Update Product' : 'Add Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Rest of the ProductManagement component remains the same...