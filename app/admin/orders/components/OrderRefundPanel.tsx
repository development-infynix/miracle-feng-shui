'use client';

import React, { useState } from 'react';
import Alert from '@/app/components/alert';
import { OrderItemData } from '../types';

interface OrderRefundPanelProps {
  order: OrderItemData;
  onUpdated: (order: OrderItemData) => void;
}

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
const actionButton =
  'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export default function OrderRefundPanel({ order, onUpdated }: OrderRefundPanelProps) {
  const refund = order.refund;
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  // An order the store cancelled itself, paid online and not refunded yet: the admin refunds it directly.
  const canIssue =
    !refund && order.rawStatus === 'CANCELLED' && order.paymentStatus === 'PAID' && order.paymentMethod !== 'Cash on Delivery';
  if (!refund && !canIssue) return null;
  const amount = refund ? refund.amount : order.totalAmount;

  const send = async (url: string) => {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'Something went wrong. Please try again.');
      onUpdated({ ...order, paymentStatus: json.data.paymentStatus ?? order.paymentStatus, refund: json.data.refund });
      if (json.data.notice) setMessage(json.data.notice);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  const approve = () => send(`/api/admin/orders/${order.id}/refund`);
  const check = () => send(`/api/admin/orders/${order.id}/refund/check`);
  const canApprove = refund?.status === 'REQUESTED' || refund?.status === 'FAILED';

  return (
    <section>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Refund</h4>
      <div className="space-y-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
        {!refund ? (
          <>
            <p>
              You cancelled this order. Refund <strong className="text-stone-900">{money(amount)}</strong> to the customer&apos;s original payment.
            </p>
            <p className="text-xs text-stone-500">All items go back in stock when the refund completes.</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirming(true)}
              className={`${actionButton} w-full bg-stone-900 text-white hover:bg-stone-700`}
            >
              {busy ? 'Sending to Razorpay…' : 'Refund customer'}
            </button>
          </>
        ) : (
          <>
            {refund.status === 'REQUESTED' && (
              <p>
                The customer asked for <strong className="text-stone-900">{money(refund.amount)}</strong> back. No money has moved yet.
              </p>
            )}
            {refund.status === 'FAILED' && (
              <p className="text-red-700">
                The refund of {money(refund.amount)} didn&apos;t go through. {refund.failureReason}
              </p>
            )}
            {refund.status === 'PROCESSING' && (
              <p>
                Razorpay is processing <strong className="text-stone-900">{money(refund.amount)}</strong>. Stock changes once it completes.
              </p>
            )}
            {refund.status === 'PROCESSED' && (
              <p>
                <strong className="text-stone-900">{money(refund.amount)}</strong> refunded
                {refund.stockReturned ? '. The items are back in stock.' : '.'}
              </p>
            )}
            {refund.razorpayRefundId && <p className="break-all text-xs text-stone-500">Razorpay refund ID: {refund.razorpayRefundId}</p>}

            {canApprove && (
              <>
                <p className="text-xs text-stone-500">All items go back in stock when the refund completes.</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirming(true)}
                  className={`${actionButton} w-full bg-stone-900 text-white hover:bg-stone-700`}
                >
                  {busy ? 'Sending to Razorpay…' : refund.status === 'FAILED' ? 'Try refund again' : 'Approve refund'}
                </button>
              </>
            )}

            {refund.status === 'PROCESSING' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void check()}
                className={`${actionButton} w-full border border-stone-300 bg-white text-stone-700 hover:bg-stone-100`}
              >
                {busy ? 'Checking…' : 'Check status'}
              </button>
            )}
          </>
        )}

        {message && (
          <p role="alert" className="text-red-700">
            {message}
          </p>
        )}
      </div>

      <Alert
        open={confirming}
        tone="danger"
        title={`Refund ${money(amount)}?`}
        description={`This sends ${money(amount)} back to the customer's original payment for order ${order.orderNumber}. It can't be undone.`}
        onClose={() => setConfirming(false)}
        actions={[
          { label: 'Cancel', onClick: () => setConfirming(false), variant: 'default', disabled: busy },
          { label: busy ? 'Sending…' : 'Refund', onClick: () => void approve(), variant: 'danger', disabled: busy },
        ]}
      />
    </section>
  );
}
