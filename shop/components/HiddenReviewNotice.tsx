'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocale } from '@/context/CurrencyContext';

export type HiddenReview = {
  rating: number;
  comment: string;
  reasonCode: string;
  /** English fallback for the reason, e.g. "it wasn't about this product". */
  because: string;
};

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink';
const primary = `inline-flex h-11 cursor-pointer items-center justify-center bg-ink-fill px-5 font-geist text-[14px] font-semibold text-white transition-shadow hover:shadow-[0_8px_22px_rgba(231,169,59,0.45)] disabled:cursor-wait disabled:opacity-60 ${focusRing}`;
const secondary = `inline-flex h-11 cursor-pointer items-center justify-center border border-ink/30 bg-white/55 px-5 font-geist text-[14px] font-semibold text-ink transition-colors hover:text-logo-purple disabled:cursor-wait disabled:opacity-60 ${focusRing}`;

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-hidden="true" className="text-[12px] text-ink">
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={`${n <= rating ? 'fa-solid' : 'fa-regular'} fa-star`} />
      ))}
    </span>
  );
}

/**
 * The author's own taken-down review. Only they see it: blurred, with why it was taken down,
 * and the choice to delete it and write a new one.
 */
export default function HiddenReviewNotice({
  productId,
  review,
  onDeleted,
}: {
  productId: string;
  review: HiddenReview;
  onDeleted: () => void;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setConfirming(false);
    setError('');
    openerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  const because = t(`product.review_hidden_reason_${review.reasonCode.toLowerCase()}`, review.because);

  const deleteReview = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews/mine`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error);
      setOpen(false);
      onDeleted();
    } catch (err) {
      setError((err instanceof Error && err.message) || t('product.review_action_failed', 'Something went wrong. Please try again.'));
      setBusy(false);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden border border-ink/15">
        <div aria-hidden="true" className="pointer-events-none select-none space-y-1.5 p-4 blur-[3px]">
          <Stars rating={review.rating} />
          <p className="line-clamp-3 font-geist text-[15px] leading-relaxed text-ink">{review.comment}</p>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 px-4 text-center">
          <p className="font-geist text-[14px] font-semibold text-ink">
            {t('product.review_taken_down', 'Your review has been taken down')}
          </p>
          <button ref={openerRef} type="button" onClick={() => setOpen(true)} className={`cursor-pointer text-[14px] font-semibold text-ink underline underline-offset-2 ${focusRing}`}>
            {t('product.review_see_why', 'See why')}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 text-left shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id={titleId} className="font-display text-[20px] font-bold text-ink">
                {t('product.review_taken_down', 'Your review has been taken down')}
              </h2>
              <button ref={closeRef} type="button" onClick={close} aria-label={t('auth.close', 'Close')} className={`-mr-1 h-9 w-9 shrink-0 cursor-pointer rounded-md text-ink-muted hover:bg-ink/10 ${focusRing}`}>
                <i aria-hidden="true" className="fa-solid fa-xmark" />
              </button>
            </div>
            <p className="mt-1 font-geist text-[13px] text-ink-muted">{t('product.review_only_you', 'Only you can see this.')}</p>

            <p className="mt-4 font-geist text-[15px] leading-relaxed text-ink">
              {t('product.review_taken_down_because', 'It was taken down because {reason}.').replace('{reason}', because)}
            </p>

            <div className="mt-4 bg-ink/10 p-3">
              <Stars rating={review.rating} />
              <p className="mt-1 whitespace-pre-line break-words font-geist text-[14px] leading-relaxed text-ink">{review.comment}</p>
            </div>

            {error && (
              <p role="alert" className="mt-3 font-geist text-[14px] text-[#8F1610]">
                {error}
              </p>
            )}

            {confirming ? (
              <div className="mt-4 space-y-2">
                <p className="font-geist text-[14px] text-ink">
                  {t('product.review_delete_confirm', 'Delete your review for good? You can then write a new one.')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void deleteReview()} disabled={busy} className={primary.replace('bg-ink-fill', 'bg-[#8F1610]')}>
                    {busy ? t('product.review_deleting', 'Deleting…') : t('product.review_delete', 'Delete my review')}
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className={secondary}>
                    {t('product.review_cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => setConfirming(true)} className={secondary}>
                  {t('product.review_delete', 'Delete my review')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
