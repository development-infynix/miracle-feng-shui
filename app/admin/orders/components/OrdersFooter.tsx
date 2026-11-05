'use client';

import React from 'react';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from 'react-icons/md';

interface OrdersFooterProps {
  total: number;
  settledBalance: number;
  pendingBalance: number;
}

export default function OrdersFooter({ total, settledBalance, pendingBalance }: OrdersFooterProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white mt-auto shrink-0">
      <span className="text-xs text-gray-500">
        {total} {total === 1 ? 'order' : 'orders'} · Settled ₹{settledBalance.toLocaleString('en-IN')} · Pending ₹{pendingBalance.toLocaleString('en-IN')}
      </span>
      <div className="flex items-center gap-2">
        <span className="px-3 py-1.5 text-xs font-semibold rounded-md border bg-white text-gray-700 border-gray-200 inline-flex items-center">
          <MdKeyboardDoubleArrowLeft className="mr-1 text-[15px]" />
          Prev
        </span>
        <span className="px-3 py-1.5 text-xs font-semibold rounded-md border bg-[#040404] text-white border-[#040404] inline-flex items-center">
          Next
          <MdKeyboardDoubleArrowRight className="ml-1 text-[15px]" />
        </span>
      </div>
    </div>
  );
}
