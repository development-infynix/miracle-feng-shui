'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '@/context/CurrencyContext';

type ProductReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  productVariation?: string;
  /** The author had this product delivered from the shop before writing the review. */
  verifiedPurchase?: boolean;
  /** The store's public reply, if any. */
  reply?: { text: string; date: string } | null;
};

/** Only customers who've had the product delivered can review it, once. */
type ReviewEligibility = { canReview: boolean; reason: 'already_reviewed' | 'not_delivered' | null };

type ReviewsPage = {
  items: ProductReview[];
  total: number;
  hasMore: boolean;
};

const MIN_COMMENT_LENGTH = 3;
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink';
const sectionLabel = 'block font-geist text-[13px] font-semibold text-ink';

async function fetchReviews(productId: string, page: number, signal?: AbortSignal) {
  const res = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews?page=${page}`, { signal });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load reviews');
  return json.data as ReviewsPage;
}

/** Loads a product's reviews, starting only once `enabled` turns true. */
export function useProductReviews(productId: string, enabled: boolean) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    fetchReviews(productId, 1, controller.signal)
      .then((data) => {
        setReviews(data.items);
        setTotal(data.total);
        setHasMore(data.hasMore);
        setPage(1);
        setFailed(false);
        setLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setFailed(true);
        setLoading(false);
      });
    return () => controller.abort();
  }, [productId, enabled, attempt]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const next = page + 1;
      const data = await fetchReviews(productId, next);
      setReviews((current) => [...current, ...data.items]);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(next);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page, productId]);

  const retry = useCallback(() => {
    setFailed(false);
    if (reviews.length > 0) {
      void loadMore();
    } else {
      setLoading(true);
      setAttempt((value) => value + 1);
    }
  }, [loadMore, reviews.length]);

  const addReview = useCallback((review: ProductReview) => {
    setReviews((current) => [review, ...current]);
    setTotal((current) => (current ?? 0) + 1);
  }, []);

  return { reviews, total, hasMore, loading, failed, loadMore, retry, addReview };
}

export type ProductReviewsState = ReturnType<typeof useProductReviews>;

/** Five stars filled to the nearest half. A rating of 0 shows five empty stars. */
export function StarRating({ rating, className = '', label }: { rating: number; className?: string; label?: string }) {
  const rounded = Math.round(Math.max(0, Math.min(5, rating)) * 2) / 2;
  return (
    <div
      className={`flex items-center gap-0.5 text-ink ${className}`}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const icon =
          rounded >= star ? 'fa-solid fa-star' : rounded === star - 0.5 ? 'fa-solid fa-star-half-stroke' : 'fa-regular fa-star';
        return <i key={star} className={`${icon} leading-none`} />;
      })}
    </div>
  );
}

/** A star rating and comment. The server ties the review to the logged-in customer. */
function ReviewForm({ productId, onSaved, onCancel }: {
  productId: string;
  onSaved: (review: ProductReview) => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const firstStar = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstStar.current?.focus();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (rating === 0) {
      setError(t('product.review_rating_required', 'Choose a star rating for your review.'));
      return;
    }
    if (comment.trim().length < MIN_COMMENT_LENGTH) {
      setError(t('product.review_comment_required', 'Write at least 3 characters about this product.'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.details?.[0]?.message || json.error || t('product.review_save_failed', "Couldn't save your review. Please try again."));
        setSaving(false);
        return;
      }
      onSaved(json.data);
    } catch {
      setError(t('product.review_save_failed', "Couldn't save your review. Please try again."));
      setSaving(false);
    }
  };

  const shownRating = hovered || rating;

  return (
    <form onSubmit={submit} noValidate className="space-y-4 text-left">
      {error && <p role="alert" className="font-geist text-[14px] text-[#8F1610]">{error}</p>}

      <fieldset>
        <legend className={sectionLabel}>{t('product.review_your_rating', 'Your rating')}</legend>
        <div className="mt-1 flex" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              onMouseEnter={() => setHovered(star)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink"
            >
              <input
                ref={star === 1 ? firstStar : undefined}
                type="radio"
                name="review-rating"
                value={star}
                checked={rating === star}
                onChange={() => setRating(star)}
                aria-label={t('product.rating_out_of', '{rating} out of 5').replace('{rating}', String(star))}
                className="sr-only"
              />
              <i aria-hidden="true" className={`${star <= shownRating ? 'fa-solid' : 'fa-regular'} fa-star text-[20px] text-ink`} />
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="review-comment" className={sectionLabel}>{t('product.review_your_review', 'Your review')}</label>
        <textarea
          id="review-comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ outline: 'none' }}
          className="mt-2 block w-full resize-y border border-white/70 bg-white/55 px-4 py-3 font-geist text-[16px] text-ink caret-ink transition-[border-color,box-shadow] focus:border-ink focus:shadow-[0_0_0_3px_rgba(20,18,16,0.12)]"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className={`h-12 min-w-0 flex-1 cursor-pointer bg-ink-fill px-4 transition-colors hover:shadow-[0_8px_22px_rgba(231,169,59,0.45)] disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
        >
          <span className="font-geist text-[15px] font-semibold text-white">
            {saving ? t('product.review_saving', 'Submitting…') : t('product.review_submit', 'Submit review')}
          </span>
        </button>
        <button type="button" onClick={onCancel} className={`group h-12 shrink-0 cursor-pointer px-3 ${focusRing}`}>
          <span className="font-geist text-[15px] font-semibold text-ink transition-colors group-hover:text-logo-purple">
            {t('product.review_cancel', 'Cancel')}
          </span>
        </button>
      </div>
    </form>
  );
}

interface ProductReviewListProps {
  state: ProductReviewsState;
  productId: string;
  signedIn: boolean;
  /** Stays false until the session check finishes, so no button appears and then changes. */
  guest: boolean;
  onSignIn: () => void;
}

export function ProductReviewList({ state, productId, signedIn, guest, onSignIn }: ProductReviewListProps) {
  const { t } = useLocale();
  const { reviews, total, hasMore, loading, failed, loadMore, retry, addReview } = state;
  const [writing, setWriting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);

  // Signed-in customers only see the review button once we know they've received this product.
  useEffect(() => {
    if (!signedIn) return;
    const controller = new AbortController();
    fetch(`/api/products/${encodeURIComponent(productId)}/reviews/eligibility`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (json?.success) setEligibility(json.data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [productId, signedIn]);

  const reviewAction = writing ? (
    <ReviewForm
      productId={productId}
      onCancel={() => setWriting(false)}
      onSaved={(review) => {
        addReview(review);
        setWriting(false);
        setSubmitted(true);
      }}
    />
  ) : submitted ? (
    <p role="status" className="font-geist text-[14px] font-medium text-ink">
      {t('product.review_thanks', 'Thanks! Your review has been added.')}
    </p>
  ) : guest ? (
    <button type="button" onClick={onSignIn} className={`h-12 cursor-pointer bg-ink-fill px-6 transition-colors hover:shadow-[0_8px_22px_rgba(231,169,59,0.45)] ${focusRing}`}>
      <span className="font-geist text-[15px] font-semibold text-white">{t('product.login_to_review', 'Login to add review')}</span>
    </button>
  ) : signedIn && eligibility?.canReview ? (
    <button type="button" onClick={() => setWriting(true)} className={`h-12 cursor-pointer bg-ink-fill px-6 transition-colors hover:shadow-[0_8px_22px_rgba(231,169,59,0.45)] ${focusRing}`}>
      <span className="font-geist text-[15px] font-semibold text-white">{t('product.add_review', 'Add review')}</span>
    </button>
  ) : signedIn && eligibility ? (
    <p className="font-geist text-[14px] text-ink-muted">
      {eligibility.reason === 'already_reviewed'
        ? t('product.review_already', "You've reviewed this product.")
        : t('product.review_buyers_only', 'Only customers who have received this product can review it.')}
    </p>
  ) : null;

  if (loading && total === null) {
    return (
      <div aria-busy="true" className="space-y-5">
        {[0, 1, 2].map((row) => (
          <div key={row} className="space-y-2">
            <div className="h-3 w-40 animate-pulse rounded-sm bg-ink/10 motion-reduce:animate-none" />
            <div className="h-3 w-full animate-pulse rounded-sm bg-ink/10 motion-reduce:animate-none" />
            <div className="h-3 w-3/4 animate-pulse rounded-sm bg-ink/10 motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {total === 0 && (
        <div className={`py-10 ${writing ? '' : 'text-center'}`}>
          {!writing && (
            <div className="mx-auto mb-5 max-w-[36ch]">
              <h3>
                <span className="block font-display text-[22px] font-bold text-ink">
                  {t('product.no_reviews', 'No reviews yet')}
                </span>
              </h3>
              <p className="mt-2 font-geist text-[14px] leading-relaxed text-ink">
                {t('product.reviews_empty_hint', 'Be the first to review this product.')}
              </p>
            </div>
          )}
          {reviewAction}
        </div>
      )}

      {total !== null && total > 0 && <div className="border-b border-ink/15 pb-4">{reviewAction}</div>}

      {reviews.length > 0 && (
        <ul className="divide-y divide-ink/15">
          {reviews.map((review) => (
            <li key={review.id} className="space-y-1.5 py-4 first:pt-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <StarRating
                  rating={review.rating}
                  className="text-[12px]"
                  label={t('product.rating_out_of', '{rating} out of 5').replace('{rating}', String(review.rating))}
                />
                <span className="font-geist text-[14px] font-semibold text-ink">{review.author}</span>
                {review.verifiedPurchase && (
                  <span
                    title={t('product.verified_purchase_hint', 'Bought from us and reviewed after it was delivered.')}
                    className="inline-flex items-center gap-1 border border-[#1F6F43]/30 bg-[#EEF6F0] px-1.5 py-0.5 font-geist text-[11px] font-semibold text-[#1F6F43]"
                  >
                    <i aria-hidden="true" className="fa-solid fa-circle-check text-[10px]" />
                    {t('product.verified_purchase', 'Verified Purchase')}
                  </span>
                )}
                <span className="font-geist text-[12px] tabular-nums text-ink-muted">{review.date}</span>
              </div>
              {review.productVariation && <p className="font-geist text-[12px] text-ink-muted">{review.productVariation}</p>}
              <p className="whitespace-pre-line font-geist text-[15px] leading-relaxed text-ink">{review.comment}</p>
              {review.reply && (
                <div className="mt-2 border-l-2 border-ink/30 bg-ink/10 px-3 py-2.5">
                  <p className="font-geist text-[12px] font-semibold text-ink">
                    {t('product.review_store_reply', 'Response from Miracle Feng Shui')}
                    <span className="ml-2 font-normal tabular-nums text-ink-muted">{review.reply.date}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-line font-geist text-[14px] leading-relaxed text-ink">{review.reply.text}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {failed && (
        <p role="alert" className="py-4 text-center font-geist text-[14px] text-ink">
          {t('product.reviews_error', "Couldn't load reviews.")}{' '}
          <button type="button" onClick={retry} className={`group cursor-pointer ${focusRing}`}>
            <span className="font-geist text-[14px] font-semibold text-ink underline underline-offset-2 transition-colors group-hover:text-logo-purple">
              {t('product.reviews_retry', 'Try again')}
            </span>
          </button>
        </p>
      )}

      {hasMore && !failed && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className={`group h-11 cursor-pointer border border-ink/30 px-5 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
          >
            <span className="font-geist text-[14px] font-semibold text-ink transition-colors group-hover:text-logo-purple">
              {loading ? t('shop.loading_more', 'Loading…') : t('product.reviews_load_more', 'Load more reviews')}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
