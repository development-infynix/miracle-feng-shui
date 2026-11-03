'use client';

import React, { useState } from 'react';
import { LuFolderOpen } from 'react-icons/lu';
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
    <div className="bg-white rounded-lg border border-gray-100 shadow-2xs overflow-hidden flex flex-col">
      <div className="relative w-full h-36 bg-gray-100">
        {showImage ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <LuFolderOpen className="h-9 w-9" aria-hidden="true" />
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
        <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
          {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
        </span>
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
