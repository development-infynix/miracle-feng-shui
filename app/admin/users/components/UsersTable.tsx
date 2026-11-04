'use client';

import React from 'react';
import { MdKeyboardDoubleArrowRight } from 'react-icons/md';
import type { UserRow } from '../types';

interface UsersTableProps {
  users: UserRow[];
  page: number;
  pageSize: number;
  /** Search term, only used for the empty-state message. */
  search: string;
  /** Opens the shared customer detail drawer (owned by UsersView). */
  onView: (user: UserRow) => void;
}

const PAGE_SIZE_FALLBACK = 20;

export default function UsersTable({ users, page, pageSize, search, onView }: UsersTableProps) {

  return (
    <table className="w-full text-left border-collapse">
      <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
        <tr className="text-[11px] uppercase tracking-wide text-gray-500">
          <th className="py-2.5 px-4 font-bold">#</th>
          <th className="py-2.5 px-4 font-bold">Name</th>
          <th className="py-2.5 px-4 font-bold">Email</th>
          <th className="py-2.5 px-4 font-bold">Phone</th>
          <th className="py-2.5 px-4 font-bold text-center">Orders</th>
          <th className="py-2.5 px-4 font-bold">Joined</th>
          <th className="py-2.5 px-4 font-bold text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
              {search ? `No customers found matching “${search}”.` : 'No customer accounts yet.'}
            </td>
          </tr>
        ) : (
          users.map((user, idx) => (
            <tr
              key={user.id}
              className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors text-xs text-gray-700"
            >
              <td className="py-2.5 px-4 text-gray-400 tabular-nums">
                {(page - 1) * (pageSize || PAGE_SIZE_FALLBACK) + idx + 1}
              </td>
              <td className="py-2.5 px-4 font-semibold text-gray-900 max-w-[180px] truncate" title={user.name}>
                {user.name}
              </td>
              <td className="py-2.5 px-4 max-w-[220px] truncate" title={user.email}>
                {user.email}
              </td>
              <td className="py-2.5 px-4 whitespace-nowrap">{user.phone || '—'}</td>
              <td className="py-2.5 px-4 text-center tabular-nums">{user._count.orders}</td>
              <td className="py-2.5 px-4 whitespace-nowrap text-gray-500">
                {new Date(user.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="py-2.5 px-4 text-center whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => onView(user)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#040404] text-white hover:bg-black transition-colors cursor-pointer"
                  title={`View ${user.name}`}
                >
                  View
                  <MdKeyboardDoubleArrowRight className="ml-1 text-[15px]" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
