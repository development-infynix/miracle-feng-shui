import React from 'react';
import Link from 'next/link';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from 'react-icons/md';

interface UsersFooterProps {
  page: number;
  totalPages: number;
  total: number;
  search: string;
}

const baseClass = 'px-3 py-1.5 text-xs font-semibold rounded-md border inline-flex items-center';
const disabledClass = 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';

function usersUrl(page: number, q: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q) params.set('q', q);
  const qs = params.toString();
  return qs ? `/admin/users?${qs}` : '/admin/users';
}

export default function UsersFooter({ page, totalPages, total, search }: UsersFooterProps) {
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white mt-auto shrink-0">
      <span className="text-xs text-gray-500">
        Page {page} of {totalPages} · {total} {total === 1 ? 'customer' : 'customers'}
      </span>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link href={usersUrl(page - 1, search)} className={`${baseClass} bg-white text-gray-700 border-gray-200 hover:bg-gray-100`}>
            <MdKeyboardDoubleArrowLeft className="mr-1 text-[15px]" />
            Prev
          </Link>
        ) : (
          <span className={`${baseClass} ${disabledClass}`}>
            <MdKeyboardDoubleArrowLeft className="mr-1 text-[15px]" />
            Prev
          </span>
        )}
        {hasNext ? (
          <Link
            href={usersUrl(page + 1, search)}
            style={{ color: '#ffffff' }}
            className={`${baseClass} bg-[#040404] text-white border-[#040404] hover:bg-black`}
          >
            Next
            <MdKeyboardDoubleArrowRight className="ml-1 text-[15px]" />
          </Link>
        ) : (
          <span className={`${baseClass} ${disabledClass}`}>
            Next
            <MdKeyboardDoubleArrowRight className="ml-1 text-[15px]" />
          </span>
        )}
      </div>
    </div>
  );
}
