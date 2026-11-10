'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { canResizeImage } from '@/lib/images';
import { AdminReview, HIDE_REASONS, ReviewHideReason, hideReasonLabel } from '../types';

const day = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

const button =
  'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-900';

function Stars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className={`text-[11px] ${rating <= 2 ? 'text-red-600' : 'text-amber-500'}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} aria-hidden="true" className={`${n <= rating ? 'fa-solid' : 'fa-regular'} fa-star`} />
      ))}
    </span>
  );
}

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.details?.[0]?.message || json.error || 'Something went wrong. Please try again.');
  return json.data;
}

interface ReviewCardProps {
  review: AdminReview;
  /** The review left the list (hidden from the Reviews page, or restored from the Archive). */
  onRemoved: (id: string, message: string) => void;
  onChanged: (review: AdminReview) => void;
}

/**
 * One review with what an admin can do about it. Shown reviews can be replied to or hidden;
 * hidden ones (on the Archive page) show why, and can be restored. Nothing is deleted.
 */
export default function ReviewCard({ review, onRemoved, onChanged }: ReviewCardProps) {
  const hidden = Boolean(review.hiddenAt);
  const [mode, setMode] = useState<'idle' | 'reply' | 'hide'>('idle');
  const [replyText, setReplyText] = useState(review.reply ?? '');
  const [reason, setReason] = useState<ReviewHideReason | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const appealOpen = hidden && Boolean(review.appealedAt) && !review.appealResolvedAt;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveReply = () =>
    run(async () => {
      const data = await send(`/api/admin/reviews/${review.id}/reply`, 'PUT', { reply: replyText });
      onChanged({ ...review, reply: data.reply, repliedAt: data.repliedAt });
      setMode('idle');
    });

  const hide = () => {
    if (!reason) {
      setError('Choose why this review is being hidden.');
      return;
    }
    if (reason === 'OTHER' && !note.trim()) {
      setError('Say why, for "Other".');
      return;
    }
    void run(async () => {
      await send(`/api/admin/reviews/${review.id}`, 'PATCH', { hidden: true, reason, ...(note.trim() && { note: note.trim() }) });
      onRemoved(review.id, 'Review hidden from the store. It’s on the Archive page if you need it back.');
    });
  };

  const keepHidden = () => {
    if (answer.trim().length < 5) {
      setError('Write a short answer for the customer.');
      return;
    }
    void run(async () => {
      const data = await send(`/api/admin/reviews/${review.id}/appeal`, 'POST', { response: answer.trim() });
      onChanged({ ...review, appealResponse: data.appealResponse, appealResolvedAt: data.appealResolvedAt });
      setAnswer('');
    });
  };

  const restore = () =>
    run(async () => {
      await send(`/api/admin/reviews/${review.id}`, 'PATCH', { hidden: false });
      onRemoved(review.id, 'Review restored. It’s showing in the store again.');
    });

  const image = review.product.image;

  return (
    <article className="space-y-3 px-4 py-4 text-sm text-gray-700">
      <header className="flex items-start gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
          {image && <Image src={image} alt="" fill sizes="40px" unoptimized={!canResizeImage(image)} className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-900" title={review.product.title}>
            {review.product.title}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
            <Stars rating={review.rating} />
            <span className="font-medium text-gray-800">{review.author}</span>
            {review.verifiedPurchase ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-px text-[10px] font-semibold text-emerald-800">
                Verified Purchase
              </span>
            ) : (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-1.5 py-px text-[10px] font-semibold text-gray-600" title="No delivered order of this product before the review">
                Not verified
              </span>
            )}
            <span className="tabular-nums">{day(review.createdAt)}</span>
          </p>
        </div>
      </header>

      <p className="whitespace-pre-wrap break-words text-sm text-gray-900">{review.comment}</p>

      {hidden && (
        <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <span className="font-semibold text-gray-800">Hidden: {hideReasonLabel(review.hiddenReason)}</span>
          {review.hiddenNote ? ` — ${review.hiddenNote}` : ''}
          <span className="block text-gray-500">
            {review.hiddenAt ? day(review.hiddenAt) : ''}
            {review.hiddenBy ? ` by ${review.hiddenBy}` : ''}
          </span>
        </p>
      )}

      {hidden && review.appealedAt && (
        <div className={`space-y-2 rounded-md border px-3 py-2 text-xs ${appealOpen ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
          <p className="font-semibold text-gray-900">
            {appealOpen ? 'Customer asked us to look again' : 'Customer asked us to look again (answered)'}{' '}
            <span className="font-normal text-gray-500">{day(review.appealedAt)}</span>
          </p>
          <p className="whitespace-pre-wrap break-words text-gray-800">“{review.appealMessage}”</p>
          {review.appealResponse && (
            <p className="text-gray-700">
              <span className="font-semibold">Kept hidden. Your answer:</span> {review.appealResponse}
            </p>
          )}
          {appealOpen && (
            <div className="space-y-2 border-t border-amber-200 pt-2">
              <p className="text-gray-700">Restore the review if they&rsquo;re right, or keep it hidden and tell them why. They see your answer and get an email.</p>
              <textarea
                aria-label="Answer to the customer (if keeping it hidden)"
                placeholder="Answer to the customer, if keeping it hidden"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                maxLength={500}
                rows={2}
                className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />
              <button type="button" onClick={keepHidden} disabled={busy} className={button}>
                {busy ? 'Saving…' : 'Keep hidden and answer'}
              </button>
            </div>
          )}
        </div>
      )}

      {review.reply && mode !== 'reply' && (
        <div className="rounded-md border-l-2 border-gray-900 bg-gray-50 px-3 py-2 text-xs">
          <p className="font-semibold text-gray-800">
            Store reply <span className="font-normal text-gray-500">{review.repliedAt ? day(review.repliedAt) : ''}</span>
          </p>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-gray-700">{review.reply}</p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}

      {mode === 'reply' && (
        <div className="space-y-2">
          <label htmlFor={`reply-${review.id}`} className="block text-xs font-semibold text-gray-700">
            Public reply, shown under the review
          </label>
          <textarea
            id={`reply-${review.id}`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            maxLength={1000}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-2.5 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void saveReply()} disabled={busy} className={`${button} border-gray-900 bg-gray-900 text-white hover:bg-gray-700`}>
              {busy ? 'Saving…' : replyText.trim() ? 'Post reply' : 'Remove reply'}
            </button>
            <button type="button" onClick={() => { setMode('idle'); setReplyText(review.reply ?? ''); setError(''); }} className={button}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === 'hide' && (
        <fieldset className="space-y-2 rounded-md border border-gray-200 p-3">
          <legend className="px-1 text-xs font-semibold text-gray-700">Why hide this review?</legend>
          <p className="text-[11px] text-gray-500">
            Hide reviews for what they say, not for a low rating. A genuine complaint is better answered with a reply.
          </p>
          <div className="grid gap-1 sm:grid-cols-2">
            {HIDE_REASONS.map((r) => (
              <label key={r.value} className="flex cursor-pointer items-center gap-2 text-xs text-gray-800">
                <input type="radio" name={`hide-reason-${review.id}`} checked={reason === r.value} onChange={() => setReason(r.value)} />
                {r.label}
              </label>
            ))}
          </div>
          <input
            type="text"
            aria-label="Note (optional, required for Other)"
            placeholder={reason === 'OTHER' ? 'Why? (required)' : 'Note (optional, only admins see it)'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            className="h-8 w-full rounded-md border border-gray-300 px-2.5 text-xs outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={hide} disabled={busy} className={`${button} border-gray-900 bg-gray-900 text-white hover:bg-gray-700`}>
              {busy ? 'Hiding…' : 'Hide review'}
            </button>
            <button type="button" onClick={() => { setMode('idle'); setReason(null); setNote(''); setError(''); }} className={button}>
              Cancel
            </button>
          </div>
        </fieldset>
      )}

      {mode === 'idle' && (
        <div className="flex flex-wrap gap-2">
          {hidden ? (
            <button type="button" onClick={() => void restore()} disabled={busy} className={button}>
              <i aria-hidden="true" className="fa-solid fa-rotate-left text-[10px]" />
              {busy ? 'Restoring…' : 'Restore'}
            </button>
          ) : (
            <>
              <button type="button" onClick={() => setMode('reply')} className={button}>
                <i aria-hidden="true" className="fa-solid fa-reply text-[10px]" />
                {review.reply ? 'Edit reply' : 'Reply'}
              </button>
              <button type="button" onClick={() => setMode('hide')} className={button}>
                <i aria-hidden="true" className="fa-solid fa-eye-slash text-[10px]" />
                Hide
              </button>
            </>
          )}
          <a
            href={`/shop?product=${encodeURIComponent(review.product.id)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center px-1 text-xs font-medium text-gray-600 underline-offset-2 hover:underline"
          >
            View product
          </a>
        </div>
      )}
    </article>
  );
}
