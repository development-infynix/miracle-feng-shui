'use client';

import React, { useState } from 'react';
import type { OrderItemData, OrderUiStatus } from '../types';

export const ORDER_STATUS_OPTIONS: OrderUiStatus[] = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancellation Requested',
  'Cancellation Approved',
  'Cancelled',
];

export const ORDER_STATUS_COLORS: Record<string, string> = {
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

export const statusColor = (value: string) =>
  ORDER_STATUS_COLORS[(value || '').toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';

// Ending an order is easy to mis-click in a list, so these ask first.
const CONFIRM_STATUSES: OrderUiStatus[] = ['Cancellation Approved', 'Cancelled'];
// Once a refund is under way or done the server keeps the order cancelled, so only these are offered.
const REFUNDED_STATUSES: OrderUiStatus[] = ['Cancellation Approved', 'Cancelled'];

/**
 * The order's status as a coloured pill that is also a dropdown: picking a new status saves it at once.
 * Used in the orders table and on the phone cards; the order drawer has its own full-width select.
 */
export default function OrderStatusSelect({
  order,
  onSaved,
}: {
  order: OrderItemData;
  onSaved: (updated: OrderItemData) => void;
}) {
  const [status, setStatus] = useState<OrderUiStatus>(order.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const moneyMoved = order.refund?.status === 'PROCESSING' || order.refund?.status === 'PROCESSED';
  const options = moneyMoved ? REFUNDED_STATUSES : ORDER_STATUS_OPTIONS;
  // Keep the current status listed even if it's no longer one of the offered choices.
  const shown = options.includes(status) ? options : [status, ...options];

  // A change made in the drawer reaches here through the order prop.
  const [seen, setSeen] = useState(order.status);
  if (order.status !== seen) {
    setSeen(order.status);
    setStatus(order.status);
  }

  const save = async (next: OrderUiStatus) => {
    if (next === status || saving) return;
    if (CONFIRM_STATUSES.includes(next) && !window.confirm(`Mark order #${order.orderNumber} as ${next}?`)) return;

    const previous = status;
    setStatus(next);
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next.toUpperCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "Couldn't update the status.");
      onSaved({ ...order, status: next, rawStatus: data.data?.rawStatus ?? order.rawStatus });
    } catch (err) {
      setStatus(previous);
      setError(err instanceof Error ? err.message : "Couldn't update the status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div className="relative inline-flex items-center">
        <label htmlFor={`status-${order.id}`} className="sr-only">
          Status of order #{order.orderNumber}
        </label>
        <select
          id={`status-${order.id}`}
          value={status}
          disabled={saving}
          onChange={(e) => void save(e.target.value as OrderUiStatus)}
          title={moneyMoved ? 'This order has a refund, so it stays cancelled.' : 'Change status'}
          className={`cursor-pointer appearance-none rounded-full border py-0.5 pl-2 pr-6 text-[10px] font-bold whitespace-nowrap outline-none transition-colors hover:brightness-95 focus-visible:ring-2 focus-visible:ring-stone-900/20 disabled:cursor-wait disabled:opacity-60 ${statusColor(status)}`}
        >
          {shown.map((option) => (
            <option key={option} value={option} className="bg-white text-gray-900">
              {option}
            </option>
          ))}
        </select>
        <i
          aria-hidden="true"
          className={`fa-solid ${saving ? 'fa-spinner animate-spin' : 'fa-chevron-down'} pointer-events-none absolute right-2 text-[8px] opacity-70`}
        />
      </div>
      {error && (
        <span role="alert" className="max-w-[180px] text-[10px] font-medium leading-tight text-red-700">
          {error}
        </span>
      )}
    </div>
  );
}
