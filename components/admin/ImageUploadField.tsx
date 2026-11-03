'use client';

import React, { useRef, useState } from 'react';

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  helpText?: string;
  className?: string;
}

export default function ImageUploadField({
  label = 'Image',
  value,
  onChange,
  required = false,
  helpText,
  className = '',
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const processFile = async (file: File) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPEG, WEBP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be less than 5MB.');
      return;
    }

    setErrorMessage('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.url) {
          onChange(data.data.url);
          setIsUploading(false);
          return;
        }
      }

      // If server upload failed (e.g. auth check in demo mode), gracefully convert to Base64 Data URL
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setErrorMessage('Failed to read image file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      // Offline / network fallback to Data URL
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 block">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {value && (
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <i className="fa-solid fa-check-circle" /> Image Loaded
            </span>
          )}
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Zone & Preview */}
      {value ? (
        <div className="relative group border border-gray-200 rounded-xl p-3 bg-gray-50/70 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0 relative shadow-2xs">
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white text-xs">
                  <i className="fa-solid fa-spinner fa-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {value.startsWith('data:')
                  ? 'Local Image File (Ready)'
                  : value.split('/').pop() || 'Image attached'}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                PNG, JPG or WEBP &bull; Max 5MB
              </p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-gray-400 text-[11.5px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <i className="fa-solid fa-arrow-up-from-bracket text-[11px]" />
                  <span>{isUploading ? 'Uploading...' : 'Replace Image'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11.5px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <i className="fa-solid fa-trash-can text-[11px]" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleBrowseClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-amber-500 bg-amber-50/50 scale-[0.99]'
              : 'border-gray-300 hover:border-amber-500 bg-gray-50/50 hover:bg-amber-50/20'
          }`}
        >
          {isUploading ? (
            <div className="py-2 space-y-2">
              <i className="fa-solid fa-circle-notch fa-spin text-amber-600 text-2xl" />
              <p className="text-xs font-semibold text-gray-700">Uploading image...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-100/80 text-amber-700 mx-auto flex items-center justify-center text-base">
                <i className="fa-solid fa-cloud-arrow-up" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">
                  Click to browse or drag & drop image
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  PNG, JPG, or WEBP up to 5MB
                </p>
              </div>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-300 text-[11.5px] font-semibold text-gray-700 shadow-2xs hover:bg-gray-50"
              >
                Choose File from Computer
              </button>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-[11.5px] text-rose-600 font-medium flex items-center gap-1 mt-1">
          <i className="fa-solid fa-circle-exclamation" /> {errorMessage}
        </p>
      )}

      {helpText && !errorMessage && (
        <p className="text-[11px] text-gray-400 mt-0.5">{helpText}</p>
      )}
    </div>
  );
}
