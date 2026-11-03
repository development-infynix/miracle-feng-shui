'use client';

import React from 'react';

interface CategoriesFooterProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

const baseClass = 'px-3 py-1.5 text-xs font-semibold rounded-md border';
const disabledClass = 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';

export default function CategoriesFooter({ page, totalPages, total, onPageChange }: CategoriesFooterProps) {
  const lastPage = Math.max(1, totalPages);
  const hasPrev = page > 1;
  const hasNext = page < lastPage;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white mt-auto shrink-0">
      <span className="text-xs text-gray-500">
        Page {page} of {lastPage} · {total} {total === 1 ? 'item' : 'items'}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          className={`${baseClass} ${
            hasPrev ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 cursor-pointer' : disabledClass
          }`}
        >
          Prev
        </button>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          style={hasNext ? { color: '#ffffff' } : undefined}
          className={`${baseClass} ${
            hasNext ? 'bg-[#040404] text-white border-[#040404] hover:bg-black cursor-pointer' : disabledClass
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
