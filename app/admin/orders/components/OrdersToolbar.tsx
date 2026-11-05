'use client';

import React, { useState } from 'react';
import { IoFunnelSharp } from 'react-icons/io5';

const FILTER_OPTIONS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

interface OrdersToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  counts: { total: number; byStatus: Record<string, number> };
}

export default function OrdersToolbar({ searchQuery, onSearchChange, selectedStatus, onStatusChange, counts }: OrdersToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const active = selectedStatus !== 'All';

  return (
    <div className="flex flex-wrap items-center gap-2.5 relative z-10 px-4 py-2 bg-white">
      <div className="relative flex-1 min-w-0 sm:w-64 sm:flex-none sm:min-w-[16rem] mr-auto">
        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
        <input
          type="text"
          placeholder="Search orders..."
          aria-label="Search orders"
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

      {selectedStatus !== 'All' && (
        <div className="inline-flex h-9 max-w-[14rem] items-center gap-2 rounded-lg border border-gray-300 bg-white pl-3 pr-1 text-xs font-semibold text-gray-800">
          <span className="truncate" title={selectedStatus}>{selectedStatus}</span>
          <button
            type="button"
            onClick={() => onStatusChange('All')}
            aria-label={`Clear status filter: ${selectedStatus}`}
            title="Clear status filter"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          aria-expanded={filterOpen}
          aria-label="Filter by status"
          title="Filter by status"
          className="w-9 h-9 rounded-lg bg-[#040404] text-white hover:bg-black cursor-pointer flex items-center justify-center shadow-2xs relative"
        >
          <IoFunnelSharp className="text-sm" />
          {active && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[#040404] border border-gray-300 px-0.5">
              1
            </span>
          )}
        </button>
        {filterOpen && (
          <div className="absolute right-0 top-full mt-2 z-[1000] w-56 rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden">
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Order status</div>
            {FILTER_OPTIONS.map((st) => {
              const count = st === 'All' ? counts.total : (counts.byStatus[st] ?? 0);
              const isSel = selectedStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    onStatusChange(st);
                    setFilterOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-100 ${
                    isSel ? 'bg-gray-100 text-black' : 'text-gray-700'
                  } ${st === 'All' ? 'border-b border-gray-100' : ''}`}
                >
                  <span>{st === 'All' ? 'All Orders' : st}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${isSel ? 'bg-[#040404] text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
