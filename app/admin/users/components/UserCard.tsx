'use client';

import React from 'react';
import { MdKeyboardDoubleArrowRight } from 'react-icons/md';
import type { UserRow } from '../types';

interface UserCardProps {
  user: UserRow;
  /** Opens the shared customer detail drawer (owned by UsersView). */
  onView: (user: UserRow) => void;
}

export default function UserCard({ user, onView }: UserCardProps) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const joined = new Date(user.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-3.5 flex flex-col gap-2">
      {/* Name row with initials avatar */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600 shrink-0">
          {initials || <i className="fa-solid fa-user text-gray-400 text-[11px]" />}
        </div>
        <span className="font-bold text-sm text-gray-900 truncate" title={user.name}>
          {user.name}
        </span>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 min-w-0">
        <i className="fa-regular fa-envelope text-gray-400 text-[11px] w-3.5 text-center shrink-0" aria-hidden="true" />
        <span className="text-xs text-gray-600 truncate" title={user.email}>
          {user.email}
        </span>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-2 min-w-0">
        <i className="fa-solid fa-phone text-gray-400 text-[11px] w-3.5 text-center shrink-0" aria-hidden="true" />
        <span className="text-xs text-gray-600 truncate">{user.phone || '—'}</span>
      </div>

      {/* Joined + View action share the divider footer row */}
      <div className="flex items-center justify-between gap-2 min-w-0 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <i className="fa-regular fa-calendar text-gray-400 text-[11px] w-3.5 text-center shrink-0" aria-hidden="true" />
          <span className="text-[11px] text-gray-500">Joined {joined}</span>
        </div>
        <button
          type="button"
          onClick={() => onView(user)}
          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#040404] text-white hover:bg-black transition-colors cursor-pointer shrink-0"
          title={`View ${user.name}`}
        >
          View
          <MdKeyboardDoubleArrowRight className="ml-1 text-[15px]" />
        </button>
      </div>
    </div>
  );
}
