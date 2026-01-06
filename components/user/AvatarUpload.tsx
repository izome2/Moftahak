'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User, Upload, X, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentImage, onImageChange }) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار صورة صالحة');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Upload to server/cloud storage
    // For now, just use the preview
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload to server
      const response = await fetch('/api/user/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Update preview with server URL
        setPreview(data.imageUrl);
        onImageChange(data.imageUrl);
      } else {
        setError(data.message || 'فشل رفع الصورة');
        // Reset file input on error
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('فشل رفع الصورة. يرجى المحاولة مرة أخرى');
      // Reset file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setIsUploading(true);
    setError('');
    
    try {
      const response = await fetch('/api/user/upload', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setPreview(null);
        onImageChange('/images/default-avatar.svg');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(data.message || 'فشل حذف الصورة');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('فشل حذف الصورة. يرجى المحاولة مرة أخرى');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* Avatar Preview */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative group"
      >
        <div className="relative w-40 h-40 rounded-full overflow-hidden border-[6px] border-white shadow-[0_8px_30px_rgba(237,191,140,0.3)] ring-4 ring-primary/20">
          {preview ? (
            <Image
              src={preview}
              alt="صورة المستخدم"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-accent to-primary/20 flex items-center justify-center">
              <User className="text-secondary/70" size={56} />
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-secondary/70 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="text-white animate-spin" size={40} />
            </div>
          )}
        </div>

        {/* Remove Button */}
        {preview && !isUploading && (
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-2 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-all shadow-[0_4px_15px_rgba(16,48,43,0.4)] hover:shadow-[0_6px_20px_rgba(16,48,43,0.5)] hover:scale-110"
            aria-label="إزالة الصورة"
          >
            <X size={18} />
          </button>
        )}
      </motion.div>

      {/* Upload Button */}
      <div className="flex flex-col items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="avatar-upload"
          disabled={isUploading}
        />
        <label htmlFor="avatar-upload" className={`cursor-pointer ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-secondary text-white hover:bg-secondary/90 transition-all duration-300 font-semibold font-dubai shadow-[0_4px_15px_rgba(16,48,43,0.25)] hover:shadow-[0_6px_20px_rgba(16,48,43,0.35)] hover:-translate-y-0.5">
            <Upload size={20} />
            {isUploading ? 'جاري الرفع...' : 'تغيير الصورة'}
          </div>
        </label>
        <p className="text-sm text-secondary/60 text-center font-dubai">
          JPG، PNG أو WebP (حد أقصى 5 ميجابايت)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-red-50 border-2 border-red-200 text-red-700 px-5 py-3 rounded-2xl text-sm font-dubai shadow-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default AvatarUpload;
