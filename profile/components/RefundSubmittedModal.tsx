'use client';

import React, { useRef } from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from '@/home/components/useGlassModal';
import { REFUND_WORKING_DAYS } from '@/lib/payment-options';
import { primaryButton, primaryLabel } from './profileUi';

export default function RefundSubmittedModal({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  const poured = useGlassModal({ open: true, onClose, panelRef, initialFocusRef: okRef });
  const title = t('profile.refund_submitted', 'Refund request submitted');

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
        aria-label={title}
        className={`bg-white border border-[#E1E3DF] relative w-full max-w-[420px] rounded-[28px] p-6 text-center transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${poured ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
      >
        <h2>
          <span className="block font-serif text-[24px] font-bold leading-tight tracking-tight text-[#222222]">{title}</span>
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#222222]">
          {t('profile.refund_time', 'It may take up to {days} working days after your request is approved.').replace('{days}', String(REFUND_WORKING_DAYS))}
        </p>
        <button ref={okRef} type="button" onClick={onClose} className={`${primaryButton} mt-5 w-full`}>
          <span className={primaryLabel}>{t('profile.refund_ok', 'OK')}</span>
        </button>
      </div>
    </div>
  );
}
