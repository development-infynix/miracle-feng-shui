'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from '@/home/components/useGlassModal';
import type { CustomerOrder } from './ProfileOrders';
import {
  FormError,
  focusRing,
  primaryButton,
  primaryLabel,
  secondaryButton,
  secondaryLabel,
  textButton,
  textLabel,
} from './profileUi';

const MIN_REASON = 3;
const MAX_REASON = 500;

interface CancelOrderModalProps {
  orderId: string;
  orderNumber: string;
  onClose: () => void;
  onRequested: (order: CustomerOrder) => void;
  onRefused: () => void;
}

/** The two steps, joined by a thread that fills as the customer moves on. */
function Stepper({ step }: { step: 1 | 2 }) {
  const { t } = useLocale();
  const steps = [t('profile.cancel_step_reason', 'Reason'), t('profile.cancel_step_confirm', 'Confirm')];

  return (
    <ol className="flex list-none items-center gap-2">
      {steps.map((label, index) => {
        const number = index + 1;
        const done = number < step;
        const current = number === step;
        return (
          <React.Fragment key={label}>
            {index > 0 && (
              <li aria-hidden="true" className="relative h-[3px] w-10 overflow-hidden rounded-full bg-[#431769]/20">
                <span className={`absolute inset-0 origin-left rounded-full bg-[#431769] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${step > 1 ? 'scale-x-100' : 'scale-x-0'}`} />
              </li>
            )}
            <li aria-current={current ? 'step' : undefined} className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border border-[#431769] font-outfit text-[12px] font-semibold tabular-nums transition-colors ${done || current ? 'bg-[#431769] text-white' : 'text-[#431769]'}`}>
                {done ? <i aria-hidden="true" className="fa-solid fa-check text-[10px]" /> : number}
              </span>
              <span className={`font-outfit text-[13px] font-semibold ${current ? 'text-[#111111]' : 'text-[#5B4A70]'}`}>{label}</span>
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
}

export default function CancelOrderModal({ orderId, orderNumber, onClose, onRequested, onRefused }: CancelOrderModalProps) {
  const { t } = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Stays open while sending, so the customer sees whether the request went through.
  const close = () => {
    if (!sending) onClose();
  };
  const poured = useGlassModal({ open: true, onClose: close, panelRef, initialFocusRef: reasonRef });

  useEffect(() => {
    if (step === 2) confirmHeadingRef.current?.focus();
  }, [step]);

  const goToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < MIN_REASON) {
      setError(t('profile.cancel_reason_required', 'Tell us why you wish to cancel so we can review your request.'));
      reasonRef.current?.focus();
      return;
    }
    setError('');
    setStep(2);
  };

  const backToReason = () => {
    setError('');
    setStep(1);
    // The field only exists again after this render.
    setTimeout(() => reasonRef.current?.focus(), 0);
  };

  const submit = async () => {
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (res.status === 409) onRefused();
        throw new Error(json.details?.[0]?.message || json.error);
      }
      onRequested(json.data);
    } catch (err) {
      setError((err instanceof Error && err.message) || t('profile.cancel_failed', "We couldn't send your request. Please try again."));
      setSending(false);
    }
  };

  const title = step === 1 ? t('profile.cancel_why', 'Why do you wish to cancel?') : t('profile.cancel_confirm_title', 'Confirm cancellation');

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-3">
      <div
        aria-hidden="true"
        onClick={close}
        className={`absolute inset-0 bg-[#2B154C]/25 backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none ${poured ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`glass-veil relative max-h-full w-full max-w-[480px] overflow-y-auto no-scrollbar rounded-[28px] p-5 shadow-[0_6px_10px_rgba(67,23,105,0.14),inset_0_2px_0_rgba(255,255,255,0.7),inset_0_-3px_5px_rgba(67,23,105,0.16)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:p-6 ${poured ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
      >
        <div className="flex items-center justify-between gap-3">
          <Stepper step={step} />
          <button
            type="button"
            aria-label={t('auth.close', 'Close')}
            disabled={sending}
            onClick={close}
            className={`group -mr-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            <i aria-hidden="true" className="fa-solid fa-xmark text-[18px] text-[#111111] transition-colors group-hover:text-[#7A2FC0]" />
          </button>
        </div>

        <p className="mt-4 font-outfit text-[13px] tabular-nums text-[#5B4A70]">
          {t('profile.order', 'Order')} #{orderNumber}
        </p>

        {step === 1 ? (
          <form onSubmit={goToConfirm} noValidate>
            <h2>
              <span className="mt-1 block font-serif text-[24px] font-bold leading-tight tracking-tight text-[#111111]">{title}</span>
            </h2>

            <label htmlFor="cancel-reason" className="mt-4 block font-outfit text-[13px] font-semibold text-[#431769]">
              {t('profile.cancel_reason_label', 'Your reason')}
            </label>
            <textarea
              ref={reasonRef}
              id="cancel-reason"
              rows={4}
              maxLength={MAX_REASON}
              value={reason}
              placeholder={t('profile.cancel_reason_placeholder', 'For example, I ordered the wrong item.')}
              onChange={(e) => setReason(e.target.value)}
              aria-invalid={Boolean(error)}
              // Replaces the site-wide outline with the field's own focus ring.
              style={{ outline: 'none' }}
              className="mt-1.5 block w-full resize-none rounded-md border border-white/70 bg-white/55 px-4 py-3 font-outfit text-[16px] leading-snug text-[#111111] caret-[#7A2FC0] transition-[border-color,box-shadow] placeholder:text-[#5B4A70] focus:border-[#7A2FC0] focus:shadow-[0_0_0_3px_rgba(122,47,192,0.18)]"
            />
            <p className="mt-1 text-right font-outfit text-[12px] tabular-nums text-[#5B4A70]">
              {reason.length}/{MAX_REASON}
            </p>

            {error && <div className="mt-2"><FormError>{error}</FormError></div>}

            <button type="submit" className={`${primaryButton} mt-3 w-full`}>
              <span className={primaryLabel}>{t('profile.cancel_next', 'Next')}</span>
            </button>
          </form>
        ) : (
          <div>
            <h2 ref={confirmHeadingRef} tabIndex={-1} style={{ outline: 'none' }}>
              <span className="mt-1 block font-serif text-[24px] font-bold leading-tight tracking-tight text-[#111111]">{title}</span>
            </h2>
            <p className="mt-2 font-outfit text-[15px] leading-relaxed text-[#2B1A3F]">
              {t('profile.cancel_validated', "Your request will be validated by our team. Your order isn't cancelled until it's approved.")}
            </p>

            <div className="mt-4 border-t border-[#431769]/15 pt-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-outfit text-[13px] font-semibold text-[#431769]">{t('profile.cancel_reason_label', 'Your reason')}</p>
                <button type="button" disabled={sending} onClick={backToReason} className={textButton}>
                  <span className={textLabel}>{t('profile.cancel_edit_reason', 'Edit reason')}</span>
                </button>
              </div>
              <p className="mt-1 max-h-28 overflow-y-auto no-scrollbar whitespace-pre-wrap break-words font-outfit text-[15px] leading-snug text-[#111111]">
                {reason.trim()}
              </p>
            </div>

            {error && <div className="mt-3"><FormError>{error}</FormError></div>}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-3">
              <button type="button" disabled={sending} onClick={close} className={secondaryButton}>
                <span className={secondaryLabel}>{t('profile.cancel_no_thanks', 'No thanks')}</span>
              </button>
              <button type="button" disabled={sending} onClick={() => void submit()} className={`${primaryButton} !px-4`}>
                <span className={primaryLabel}>
                  {sending ? t('profile.cancel_requesting', 'Sending request…') : t('profile.cancel_request', 'Request cancellation')}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
