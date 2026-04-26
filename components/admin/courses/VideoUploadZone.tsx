'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, Loader2, Film, ImageIcon, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { isValidVideoFile, isValidImageFile } from '@/lib/courses/utils';

interface VideoUploadZoneProps {
  type: 'video' | 'image' | 'thumbnail';
  currentUrl?: string | null;
  courseId?: string;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
  label?: string;
}

export default function VideoUploadZone({
  type,
  currentUrl,
  courseId,
  onUploadComplete,
  onRemove,
  label,
}: VideoUploadZoneProps) {
  const t = useTranslation();
  const et = t.admin.coursesPage.editor;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const isVideo = type === 'video';
  const accept = isVideo ? 'video/mp4,video/webm,video/ogg,video/quicktime' : 'image/jpeg,image/png,image/webp';

  const buildUploadPath = (file: File) => {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    const safeCourseId = courseId?.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 80);
    const folder = isVideo ? 'courses/videos' : 'courses/images';
    const prefix = safeCourseId ? `${safeCourseId}/` : '';

    return `${folder}/${prefix}${sanitizedName}-${timestamp}.${extension}`;
  };

  const uploadViaApiRoute = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (courseId) formData.append('courseId', courseId);

    const xhr = new XMLHttpRequest();

    return new Promise<{ url: string }>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error('Invalid response'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || 'Upload failed'));
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error')));

      xhr.open('POST', '/api/admin/courses/upload');
      xhr.send(formData);
    });
  };

  const uploadDirectToBlob = async (file: File) => {
    const { upload } = await import('@vercel/blob/client');
    const result = await upload(buildUploadPath(file), file, {
      access: 'public',
      handleUploadUrl: '/api/admin/courses/upload/client',
      clientPayload: JSON.stringify({ type, courseId }),
      contentType: file.type,
      multipart: true,
      onUploadProgress: ({ percentage }) => {
        setProgress(Math.round(percentage));
      },
    });

    return { url: result.url };
  };

  const handleFile = async (file: File) => {
    setError(null);

    // التحقق من صلاحية الملف
    const validation = isVideo ? isValidVideoFile(file) : isValidImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'ملف غير صالح');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let result: { url: string };

      if (isVideo) {
        try {
          result = await uploadDirectToBlob(file);
        } catch (err) {
          const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
          if (!isLocalhost) throw err;

          setProgress(0);
          result = await uploadViaApiRoute(file);
        }
      } else {
        result = await uploadViaApiRoute(file);
      }

      onUploadComplete(result.url);
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes('client token')
          ? 'تعذر بدء رفع الفيديو. تأكد من إعداد BLOB_READ_WRITE_TOKEN على السيرفر.'
          : err instanceof Error
            ? err.message
            : 'حدث خطأ أثناء الرفع';
      setError(message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-secondary/70">{label}</label>
      )}

      {currentUrl && !uploading ? (
        /* معاينة الملف الحالي */
        <div className="relative rounded-xl border border-primary/15 overflow-hidden bg-primary/5">
          {isVideo ? (
            <div className="aspect-video bg-black/5 flex items-center justify-center">
              <video
                src={currentUrl}
                className="max-h-full max-w-full"
                controls
                preload="metadata"
              />
            </div>
          ) : (
            <div className="aspect-video relative">
              <Image
                src={currentUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <span className="px-2 py-1 rounded-lg bg-emerald-500/90 text-white text-xs flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {isVideo ? 'Video' : 'Image'}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-secondary text-xs hover:bg-white transition-colors"
              >
                {isVideo ? et.changeVideo : et.changeThumbnail}
              </button>
              {onRemove && (
                <button
                  onClick={onRemove}
                  className="w-7 h-7 rounded-lg bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* منطقة الرفع */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`
            relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer
            flex flex-col items-center justify-center gap-2
            ${dragOver ? 'border-primary bg-primary/10' : 'border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10'}
            ${uploading ? 'pointer-events-none' : ''}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-secondary/60 font-medium">{et.uploading}</p>
              {/* Progress Bar */}
              <div className="w-48 h-2 rounded-full bg-primary/20 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-secondary/40">{et.uploadProgress(progress)}</p>
            </>
          ) : (
            <>
              {isVideo ? (
                <Film className="w-8 h-8 text-primary/40" />
              ) : (
                <ImageIcon className="w-8 h-8 text-primary/40" />
              )}
              <p className="text-sm text-secondary/50 font-medium">
                {isVideo ? et.uploadVideo : et.uploadThumbnail}
              </p>
              <p className="text-xs text-secondary/30">
                {isVideo ? 'MP4, WebM, MOV (max 500MB)' : 'JPG, PNG, WebP (max 5MB)'}
              </p>
            </>
          )}
        </div>
      )}

      {/* Input مخفي */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {/* رسالة خطأ */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
