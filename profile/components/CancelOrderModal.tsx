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
              <li aria-hidden="true" className="relative h-[3px] w-10 overflow-hidden rounded-full bg-[#222222]/20">
                <span className={`absolute inset-0 origin-left rounded-full bg-[#222222] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${step > 1 ? 'scale-x-100' : 'scale-x-0'}`} />
              </li>
            )}
            <li aria-current={current ? 'step' : undefined} className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border border-[#222222] text-[12px] font-semibold tabular-nums transition-colors ${done || current ? 'bg-[#222222] text-white' : 'text-[#222222]'}`}>
                {done ? <i aria-hidden="true" className="fa-solid fa-check text-[10px]" /> : number}
              </span>
              <span className={`text-[13px] font-semibold ${current ? 'text-[#222222]' : 'text-[#595959]'}`}>{label}</span>
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
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${poured ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-white border border-[#E1E3DF] relative max-h-full w-full max-w-[480px] overflow-y-auto no-scrollbar rounded-[28px] p-5 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:p-6 ${poured ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
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
            <i aria-hidden="true" className="fa-solid fa-xmark text-[18px] text-[#222222] transition-colors group-hover:underline" />
          </button>
        </div>

        <p className="mt-4 text-[13px] tabular-nums text-[#595959]">
          {t('profile.order', 'Order')} #{orderNumber}
        </p>

        {step === 1 ? (
          <form onSubmit={goToConfirm} noValidate>
            <h2>
              <span className="mt-1 block font-serif text-[24px] font-bold leading-tight tracking-tight text-[#222222]">{title}</span>
            </h2>

            <label htmlFor="cancel-reason" className="mt-4 block text-[13px] font-semibold text-[#222222]">
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
              className="mt-1.5 block w-full resize-none rounded-lg border border-white/70 bg-white/55 px-4 py-3 text-[16px] leading-snug text-[#222222] caret-[#222222] transition-[border-color,box-shadow] placeholder:text-[#595959] focus:border-[#222222] focus:shadow-[0_0_0_3px_rgba(34,34,34,0.12)]"
            />
            <p className="mt-1 text-right text-[12px] tabular-nums text-[#595959]">
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
              <span className="mt-1 block font-serif text-[24px] font-bold leading-tight tracking-tight text-[#222222]">{title}</span>
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#222222]">
              {t('profile.cancel_validated', "Your request will be validated by our team. Your order isn't cancelled until it's approved.")}
            </p>

            <div className="mt-4 border-t border-[#E1E3DF] pt-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-semibold text-[#222222]">{t('profile.cancel_reason_label', 'Your reason')}</p>
                <button type="button" disabled={sending} onClick={backToReason} className={textButton}>
                  <span className={textLabel}>{t('profile.cancel_edit_reason', 'Edit reason')}</span>
                </button>
              </div>
              <p className="mt-1 max-h-28 overflow-y-auto no-scrollbar whitespace-pre-wrap break-words text-[15px] leading-snug text-[#222222]">
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
