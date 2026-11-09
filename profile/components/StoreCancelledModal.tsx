'use client';

import React, { useRef } from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from '@/home/components/useGlassModal';
import { REFUND_WORKING_DAYS } from '@/lib/payment-options';
import { primaryButton, primaryLabel } from './profileUi';

interface StoreCancelledModalProps {
  orderNumber: string;
  reason: string;
  total: number;
  /** The store is refunding this order. */
  refundPending: boolean;
  /** The refund has gone through. */
  refunded: boolean;
  supportEmail: string;
  onClose: () => void;
}

/** Why the store cancelled the customer's order, and what happens to their money. */
export default function StoreCancelledModal({ orderNumber, reason, total, refundPending, refunded, supportEmail, onClose }: StoreCancelledModalProps) {
  const { t, formatPrice } = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  const poured = useGlassModal({ open: true, onClose, panelRef, initialFocusRef: okRef });
  const title = t('profile.store_cancelled_title', 'Why was this order cancelled?');

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-3">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${poured ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-cancelled-title"
        className={`bg-white border border-[#E1E3DF] relative w-full max-w-[440px] rounded-[28px] p-6 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${poured ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
      >
        <h2 id="store-cancelled-title" className="font-serif text-[24px] font-bold leading-tight tracking-tight text-[#222222]">
          {title}
        </h2>
        <p className="mt-1 text-[13px] text-[#595959]">
          {t('profile.order', 'Order')} #{orderNumber}
        </p>
        <p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[#222222]">{reason}</p>
        {(refunded || refundPending) && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#D9A400]/40 bg-[#FFF8E1] px-3 py-2.5 text-[14px] leading-snug text-[#5C4300]">
            <i aria-hidden="true" className={`${refunded ? 'fa-solid fa-circle-check' : 'fa-regular fa-clock'} mt-0.5 text-[13px]`} />
            <span>
              {refunded
                ? t('profile.store_cancelled_refunded', '{amount} has been refunded to your original payment.').replace('{amount}', formatPrice(total))
                : t('profile.store_cancelled_refunding', 'Your refund of {amount} is being processed to your original payment. It may take up to {days} working days.')
                    .replace('{amount}', formatPrice(total))
                    .replace('{days}', String(REFUND_WORKING_DAYS))}
            </span>
          </p>
        )}
        <p className="mt-4 text-[13px] text-[#595959]">
          {t('profile.store_cancelled_help', 'Questions?')}{' '}
          <a href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Cancelled order ${orderNumber}`)}`} className="font-semibold text-[#222222] underline underline-offset-2">
            {supportEmail}
          </a>
        </p>
        <button ref={okRef} type="button" onClick={onClose} className={`${primaryButton} mt-5 w-full`}>
          <span className={primaryLabel}>{t('profile.refund_ok', 'OK')}</span>
        </button>
      </div>
    </div>
  );
}
