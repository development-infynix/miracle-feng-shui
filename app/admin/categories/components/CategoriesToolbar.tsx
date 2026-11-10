'use client';

import React, { useState } from 'react';
import { BsInfoSquareFill } from 'react-icons/bs';
import { CategoryStats } from '../types';

interface CategoriesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  stats: CategoryStats;
}

export default function CategoriesToolbar({ searchQuery, onSearchChange, onAdd, stats }: CategoriesToolbarProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2.5 relative z-10 px-4 py-2 bg-white">
      <div className="relative flex-1 min-w-0 sm:w-64 sm:flex-none sm:min-w-[16rem] mr-auto">
        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
        <input
          type="text"
          placeholder="Search..."
          aria-label="Search categories"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-hidden focus:border-black focus:ring-2 focus:ring-black/5 placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onAdd}
        style={{ backgroundColor: '#040404', color: '#ffffff' }}
        className="text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md hover:bg-black cursor-pointer inline-flex items-center gap-2 h-9"
      >
        <i className="fa-solid fa-plus text-xs" />
        <span className="hidden sm:inline">Add Category</span>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setInfoOpen((open) => !open)}
          title="Category stats"
          aria-label="Category stats"
          aria-expanded={infoOpen}
          className="w-9 h-9 rounded-lg bg-[#040404] text-white hover:bg-black cursor-pointer flex items-center justify-center shadow-2xs"
        >
          <BsInfoSquareFill className="text-sm" />
        </button>
        {infoOpen && (
          <div className="absolute right-0 top-full mt-2 z-[1000] w-56 rounded-lg border border-gray-200 bg-white shadow-xl p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Total Categories</span>
              <span className="font-bold text-gray-900">{stats.totalCategories}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Active Products</span>
              <span className="font-bold text-gray-900">{stats.activeProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Archived Products</span>
              <span className="font-bold text-gray-900">{stats.inactiveProducts}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
