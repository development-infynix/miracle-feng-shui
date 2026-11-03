'use client';

import React, { useState } from 'react';
import { LuImageOff, LuFolderOpen } from 'react-icons/lu';
import { MdKeyboardDoubleArrowRight } from 'react-icons/md';
import { CategoryItem } from '../types';

interface CategoryCardProps {
  category: CategoryItem;
  onView: (category: CategoryItem) => void;
}

export default function CategoryCard({ category, onView }: CategoryCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = category.image && !imageFailed;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
      <div className="relative w-full h-36 bg-gray-50">
        {showImage ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            role="img"
            aria-label={imageFailed ? 'Image failed to load' : 'No image available'}
            className="absolute inset-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-100/60 flex flex-col items-center justify-center gap-1.5 text-center px-3"
          >
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-2xs">
              {imageFailed ? (
                <LuFolderOpen className="h-5 w-5" aria-hidden="true" />
              ) : (
                <LuImageOff className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <span className="text-[11px] font-semibold text-gray-600 leading-tight">
              {imageFailed ? 'Image could not load' : 'No image available'}
            </span>
            <span className="text-[10px] text-gray-400 leading-tight">
              {imageFailed
                ? 'Check the image URL or re-upload'
                : 'Add an image to preview this category'}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="min-w-0">
          <span className="font-semibold text-gray-900 block truncate text-sm" title={category.name}>
            {category.name}
          </span>
          <span className="text-[10.5px] text-gray-400 block truncate">
            {category.description || 'No description'}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
        <div className="min-w-0">
          <span className="font-bold text-gray-900 text-sm whitespace-nowrap block leading-tight">
            {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
          </span>
          {category.inactiveCount > 0 && (
            <span className="text-[10.5px] text-gray-500 whitespace-nowrap block leading-tight">
              {category.inactiveCount} inactive
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onView(category)}
          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#040404] text-white hover:bg-black transition-colors cursor-pointer"
          title="View category"
        >
          View
          <MdKeyboardDoubleArrowRight className="ml-1" />
        </button>
      </div>
    </div>
  );
}
