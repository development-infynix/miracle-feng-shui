'use client';

import React, { useState } from 'react';
import Alert from '@/app/components/alert';
import { LuX } from 'react-icons/lu';
import { OrderItemData } from '../types';

interface ViewOrderDrawerProps {
  order: OrderItemData;
  onClose: () => void;
  onSaved: (updated: OrderItemData) => void;
  onDeleted: (orderId: string) => void;
}

const inputClass =
  'w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10';

const labelClass = 'block text-xs font-semibold text-stone-500 mb-1.5';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancellation Requested', 'Cancellation Approved', 'Cancelled'] as const;

export default function ViewOrderDrawer({ order, onClose, onSaved, onDeleted }: ViewOrderDrawerProps) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const saveStatus = async (next: typeof status) => {
    if (next === order.status || saving) return;
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
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update status.');
      onSaved({ ...order, status: next });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.');
      setStatus(order.status);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete order.');
      onDeleted(order.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order.');
      setConfirmDelete(false);
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-[#fafaf9] shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 px-6">
          <h2 id="order-details-title" className="text-xl font-bold text-stone-900">
            Order Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <LuX className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          {error && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <section>
            <dl className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white px-4">
              <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                <dt className="text-stone-500">Order</dt>
                <dd className="font-medium text-stone-900">#{order.orderNumber}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                <dt className="text-stone-500">Placed</dt>
                <dd className="font-medium text-stone-900">{order.date}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                <dt className="text-stone-500">Customer</dt>
                <dd className="font-medium text-stone-900">{order.customerName}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                <dt className="text-stone-500">Payment</dt>
                <dd className="font-medium text-stone-900">
                  {order.paymentMethod} · {order.paymentStatus}
                </dd>
              </div>
            </dl>
          </section>

          {order.cancellationReason && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Reason for cancellation</h4>
              <p className="whitespace-pre-wrap break-words rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
                {order.cancellationReason}
              </p>
            </section>
          )}

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Shipping</h4>
            <address className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm not-italic text-stone-700">
              <p className="font-medium text-stone-900">{order.customerName}</p>
              <p>{order.address}</p>
              <p>
                {order.city}, {order.state} — {order.pincode}
              </p>
              <p className="mt-1 text-stone-500">
                {order.phone} · {order.email}
              </p>
            </address>
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Items</h4>
            <div className="space-y-2">
              {order.items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-900" title={it.productName}>
                      {it.productName}
                    </p>
                    <p className="text-xs text-stone-500">× {it.quantity}</p>
                  </div>
                  <span className="font-semibold tabular-nums text-stone-900">
                    ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3 text-sm">
              <span className="text-stone-500">Total</span>
              <span className="font-bold text-stone-900">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </section>

          <section>
            <a
              href={`/api/orders/${order.orderNumber}/invoice`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 no-underline"
            >
              <i className="fa-solid fa-file-pdf text-red-600" />
              Invoice PDF
            </a>
          </section>
        </div>

        <footer className="flex shrink-0 items-center gap-2 border-t border-stone-200 bg-[#fafaf9] px-4 py-3">
          <label htmlFor="order-status" className={`${labelClass} sr-only`}>
            Fulfilment status
          </label>
          <div className="relative min-w-0 flex-1">
            <select
              id="order-status"
              value={status}
              onChange={(e) => saveStatus(e.target.value as typeof status)}
              disabled={saving}
              className={`${inputClass} h-10 min-w-0 w-full disabled:opacity-60`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {saving && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-[11px] font-semibold text-stone-500"
              >
                Saving…
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-red-600 px-3 sm:px-4 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Delete
          </button>
        </footer>

        <Alert
          open={confirmDelete}
          tone="danger"
          title="Delete this order?"
          description={`"${order.orderNumber}" will be permanently removed. This action cannot be undone.`}
          onClose={() => setConfirmDelete(false)}
          actions={[
            {
              label: 'Cancel',
              onClick: () => setConfirmDelete(false),
              variant: 'default',
              disabled: deleting,
            },
            {
              label: deleting ? 'Deleting...' : 'Delete',
              onClick: handleDelete,
              variant: 'danger',
              disabled: deleting,
            },
          ]}
        />
      </aside>
    </div>
  );
}
