'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocale } from '@/context/CurrencyContext';

export type HiddenReview = {
  rating: number;
  comment: string;
  reasonCode: string;
  /** English fallback for the reason, e.g. "it wasn't about this product". */
  because: string;
  appeal: { message: string; sentAt: string; response: string | null; answeredAt: string | null } | null;
};

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#222222]';
const primary = `inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-[#222222] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-60 ${focusRing}`;
const secondary = `inline-flex h-11 cursor-pointer items-center justify-center rounded-lg border border-[#222222]/25 bg-white px-5 text-[14px] font-semibold text-[#222222] transition-colors hover:bg-[#F5F5F3] disabled:cursor-wait disabled:opacity-60 ${focusRing}`;

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-hidden="true" className="text-[12px] text-[#222222]">
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={`${n <= rating ? 'fa-solid' : 'fa-regular'} fa-star`} />
      ))}
    </span>
  );
}

/**
 * The author's own taken-down review. Only they see it: blurred, with why it was taken down,
 * and the choice to delete it (and write a new one) or ask the store to look again.
 */
export default function HiddenReviewNotice({
  productId,
  review,
  onDeleted,
  onAppealed,
}: {
  productId: string;
  review: HiddenReview;
  onDeleted: () => void;
  onAppealed: (appeal: NonNullable<HiddenReview['appeal']>) => void;
}) {
  const { t, language } = useLocale();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'idle' | 'appeal' | 'delete'>('idle');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setMode('idle');
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
  const when = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'ar' ? 'ar' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const base = `/api/products/${encodeURIComponent(productId)}/reviews/mine`;

  const sendAppeal = async () => {
    if (message.trim().length < 5) {
      setError(t('product.review_appeal_too_short', 'Tell us a little more (at least 5 characters).'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${base}/appeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.details?.[0]?.message || json.error);
      onAppealed({ message: message.trim(), sentAt: json.data.sentAt, response: null, answeredAt: null });
      setMode('idle');
    } catch (err) {
      setError((err instanceof Error && err.message) || t('product.review_action_failed', 'Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const deleteReview = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(base, { method: 'DELETE' });
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
      <div className="relative overflow-hidden rounded-lg border border-[#E1E3DF]">
        <div aria-hidden="true" className="pointer-events-none select-none space-y-1.5 p-4 blur-[3px]">
          <Stars rating={review.rating} />
          <p className="line-clamp-3 text-[15px] leading-relaxed text-[#222222]">{review.comment}</p>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 px-4 text-center">
          <p className="text-[14px] font-semibold text-[#222222]">
            {t('product.review_taken_down', 'Your review has been taken down')}
          </p>
          <button ref={openerRef} type="button" onClick={() => setOpen(true)} className={`cursor-pointer text-[14px] font-semibold text-[#222222] underline underline-offset-2 ${focusRing}`}>
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
              <h2 id={titleId} className="font-serif text-[20px] font-bold text-[#222222]">
                {t('product.review_taken_down', 'Your review has been taken down')}
              </h2>
              <button ref={closeRef} type="button" onClick={close} aria-label={t('auth.close', 'Close')} className={`-mr-1 h-9 w-9 shrink-0 cursor-pointer rounded-md text-[#595959] hover:bg-[#F5F5F3] ${focusRing}`}>
                <i aria-hidden="true" className="fa-solid fa-xmark" />
              </button>
            </div>
            <p className="mt-1 text-[13px] text-[#595959]">{t('product.review_only_you', 'Only you can see this.')}</p>

            <p className="mt-4 text-[15px] leading-relaxed text-[#222222]">
              {t('product.review_taken_down_because', 'It was taken down because {reason}.').replace('{reason}', because)}
            </p>

            <div className="mt-4 rounded-lg bg-[#F5F5F3] p-3">
              <Stars rating={review.rating} />
              <p className="mt-1 whitespace-pre-line break-words text-[14px] leading-relaxed text-[#222222]">{review.comment}</p>
            </div>

            {review.appeal && (
              <div className="mt-4 space-y-1 text-[14px] leading-relaxed text-[#222222]">
                <p className="font-semibold">
                  {t('product.review_appeal_sent', 'You asked us to look again on {date}.').replace('{date}', when(review.appeal.sentAt))}
                </p>
                {review.appeal.response ? (
                  <p>
                    <span className="font-semibold">{t('product.review_appeal_answer', 'Our answer:')}</span> {review.appeal.response}
                  </p>
                ) : (
                  <p className="text-[#595959]">{t('product.review_appeal_waiting', "We'll answer here and by email.")}</p>
                )}
              </div>
            )}

            {error && (
              <p role="alert" className="mt-3 text-[14px] text-[#8F1610]">
                {error}
              </p>
            )}

            {mode === 'appeal' ? (
              <div className="mt-4 space-y-2">
                <label htmlFor={`${titleId}-appeal`} className="block text-[13px] font-semibold text-[#222222]">
                  {t('product.review_appeal_label', 'Why should we look again?')}
                </label>
                <textarea
                  id={`${titleId}-appeal`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full rounded-lg border border-[#222222]/25 px-3 py-2 text-[15px] text-[#222222] outline-none focus:border-[#222222]"
                />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void sendAppeal()} disabled={busy} className={primary}>
                    {busy ? t('product.review_sending', 'Sending…') : t('product.review_appeal_send', 'Send')}
                  </button>
                  <button type="button" onClick={() => { setMode('idle'); setError(''); }} className={secondary}>
                    {t('product.review_cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            ) : mode === 'delete' ? (
              <div className="mt-4 space-y-2">
                <p className="text-[14px] text-[#222222]">
                  {t('product.review_delete_confirm', 'Delete your review for good? You can then write a new one.')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void deleteReview()} disabled={busy} className={`${primary} bg-[#8F1610] hover:bg-[#6E110C]`}>
                    {busy ? t('product.review_deleting', 'Deleting…') : t('product.review_delete', 'Delete my review')}
                  </button>
                  <button type="button" onClick={() => setMode('idle')} className={secondary}>
                    {t('product.review_cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2">
                {!review.appeal && (
                  <button type="button" onClick={() => setMode('appeal')} className={primary}>
                    {t('product.review_appeal', 'Ask us to look again')}
                  </button>
                )}
                <button type="button" onClick={() => setMode('delete')} className={secondary}>
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
