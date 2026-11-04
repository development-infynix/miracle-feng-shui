'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface UsersToolbarProps {
  search: string;
  total: number;
}

export function usersUrl(page: number, q: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q) params.set('q', q);
  const qs = params.toString();
  return qs ? `/admin/users?${qs}` : '/admin/users';
}

export default function UsersToolbar({ search, total }: UsersToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(search);

  // Keep the input in sync when navigation changes the URL (prev/next, clear).
  useEffect(() => setSearchQuery(search), [search]);

  // Debounced server-side search, same 400ms feel as the categories page.
  useEffect(() => {
    const term = searchQuery.trim();
    if (term === search) return;
    const timer = setTimeout(() => {
      startTransition(() => router.replace(usersUrl(1, term)));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, search, router]);

  return (
    <div className="flex flex-wrap items-center gap-2.5 relative z-10 px-4 py-2 bg-white">
      <div className="relative flex-1 min-w-0 sm:w-64 sm:flex-none sm:min-w-[16rem] mr-auto">
        <i
          className={`fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs ${
            isPending ? 'opacity-40' : ''
          }`}
        />
        <input
          type="text"
          placeholder="Search name, email, phone..."
          aria-label="Search customer users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 h-10 text-xs sm:text-sm rounded-md border border-gray-300 bg-white shadow-sm focus:outline-hidden focus:border-black focus:ring-2 focus:ring-black/5 placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        )}
      </div>

      <span
        className="inline-flex items-center justify-center gap-1.5 px-3 h-10 rounded-md bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 tabular-nums"
        title={`${total} ${total === 1 ? 'customer' : 'customers'}`}
        aria-label={`${total} ${total === 1 ? 'customer' : 'customers'}`}
      >
        <i className="fa-solid fa-users text-gray-400 text-[11px]" />
        {total}
      </span>
    </div>
  );
}
