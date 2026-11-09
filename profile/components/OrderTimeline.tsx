'use client';

import React from 'react';
import { useLocale } from '@/context/CurrencyContext';

export type TimelineStep =
  | 'placed'
  | 'shipped'
  | 'delivered'
  | 'cancellation_requested'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded';

export interface TimelineEntry {
  step: TimelineStep;
  at: string;
}

const LABELS: Record<TimelineStep, { key: string; label: string; red?: boolean }> = {
  placed: { key: 'profile.step_placed', label: 'Placed' },
  shipped: { key: 'profile.step_shipped', label: 'Shipped' },
  delivered: { key: 'profile.step_delivered', label: 'Delivered' },
  cancellation_requested: { key: 'profile.step_cancel_requested', label: 'Cancellation requested', red: true },
  cancelled: { key: 'profile.step_cancelled', label: 'Cancelled', red: true },
  refund_requested: { key: 'profile.step_refund_requested', label: 'Refund requested' },
  refunded: { key: 'profile.step_refunded', label: 'Refunded' },
};

/** The order's main steps so far, oldest first, as a vertical line of dated checkpoints. */
export default function OrderTimeline({ timeline }: { timeline?: TimelineEntry[] }) {
  const { t, language } = useLocale();
  if (!timeline || timeline.length === 0) return null;

  const when = (iso: string) =>
    new Date(iso).toLocaleString(language === 'ar' ? 'ar' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });

  return (
    <ol aria-label={t('profile.order_progress', 'Order progress')} className="space-y-0">
      {timeline.map((entry, index) => {
        const { key, label, red } = LABELS[entry.step];
        const last = index === timeline.length - 1;
        return (
          <li key={`${entry.step}-${entry.at}`} className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-3 pb-4 last:pb-0">
            {!last && <span aria-hidden="true" className="absolute left-[9px] top-5 bottom-0 w-px bg-ink/20" />}
            <i aria-hidden="true" className={`fa-solid fa-circle-check relative mt-0.5 text-[18px] ${red ? 'text-[#8F1610]' : 'text-[#1F6F43]'}`} />
            <div className="min-w-0">
              <p className={`font-geist text-[15px] font-semibold ${red ? 'text-[#8F1610]' : 'text-ink'}`}>{t(key, label)}</p>
              <time dateTime={entry.at} className="font-geist text-[13px] tabular-nums text-ink-muted">
                {when(entry.at)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
