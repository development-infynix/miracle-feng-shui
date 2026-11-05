'use client';

import React from 'react';
import { MdKeyboardDoubleArrowRight } from 'react-icons/md';
import { OrderItemData } from '../types';

function StatusBadge({ value }: { value: string }) {
  const normalized = (value || '').toLowerCase();
  const colors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'cancellation requested': 'bg-red-50 text-red-700 border-red-200',
    'cancellation approved': 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    refunded: 'bg-gray-100 text-gray-600 border-gray-300',
    failed: 'bg-red-50 text-red-700 border-red-200',
  };
  const className = colors[normalized] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${className}`}
    >
      {value}
    </span>
  );
}

interface OrdersTableProps {
  orders: OrderItemData[];
  onView: (order: OrderItemData) => void;
}

export default function OrdersTable({ orders, onView }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-2xs">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Order</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Customer</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Items</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Payment</th>
            <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Total</th>
            <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, it) => sum + it.quantity, 0);
            return (
              <tr key={order.id} className="transition-colors hover:bg-gray-50/70">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">#{order.orderNumber}</p>
                      <p className="text-[11px] text-gray-500 whitespace-nowrap">{order.date}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 truncate max-w-[160px]">{order.customerName}</p>
                  <p className="text-[11px] text-gray-500 truncate max-w-[160px]">{order.city}{order.state ? `, ${order.state}` : ''}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-700 tabular-nums font-semibold">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={order.status} />
                  {(order.refund?.status === 'REQUESTED' || order.refund?.status === 'FAILED') && (
                    <span className="mt-1 block w-fit rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-amber-800">
                      {order.refund.status === 'FAILED' ? 'Refund failed' : 'Refund requested'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={order.paymentStatus} />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-bold text-gray-900 tabular-nums">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onView(order)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#040404] text-white hover:bg-black transition-colors cursor-pointer"
                    title="View order"
                  >
                    View
                    <MdKeyboardDoubleArrowRight className="ml-1" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
