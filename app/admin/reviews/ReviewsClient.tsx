'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReviewCard from './components/ReviewCard';
import { AdminReview, AdminReviewPage } from './types';

interface ReviewsClientProps {
  data: AdminReviewPage;
  q: string;
  rating: string;
  unanswered: boolean;
  /** Set when opened from a product's drawer. */
  product: { id: string; title: string } | null;
  hiddenCount: number;
  /** Hidden reviews whose author asked us to look again, not answered yet. */
  openAppeals: number;
}

function reviewsUrl(params: { q?: string; rating?: string; unanswered?: boolean; product?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set('q', params.q);
  if (params.rating) sp.set('rating', params.rating);
  if (params.unanswered) sp.set('unanswered', 'true');
  if (params.product) sp.set('product', params.product);
  if (params.page && params.page > 1) sp.set('page', String(params.page));
  const qs = sp.toString();
  return qs ? `/admin/reviews?${qs}` : '/admin/reviews';
}

const control =
  'h-9 rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-800 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5';

export default function ReviewsClient({ data, q, rating, unanswered, product, hiddenCount, openAppeals }: ReviewsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reviews, setReviews] = useState<AdminReview[]>(data.items);
  const [search, setSearch] = useState(q);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setReviews(data.items), [data.items]);
  useEffect(() => setSearch(q), [q]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const base = { q, rating, unanswered, product: product?.id };
  const go = (next: Partial<typeof base> & { page?: number }) =>
    startTransition(() => router.replace(reviewsUrl({ ...base, page: 1, ...next })));

  // Debounced search, like the other admin lists.
  useEffect(() => {
    const term = search.trim();
    if (term === q) return;
    const timer = setTimeout(() => startTransition(() => router.replace(reviewsUrl({ q: term, rating, unanswered, product: product?.id }))), 400);
    return () => clearTimeout(timer);
  }, [search, q, rating, unanswered, product?.id, router]);

  const filtered = Boolean(q || rating || unanswered || product);

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Reviews</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Every review showing in the store. Reply to complaints; hide only what breaks the rules.
          </p>
        </div>
        <Link href="/admin/archive?tab=reviews" className="text-xs font-medium text-gray-600 underline-offset-2 hover:underline">
          Hidden reviews ({hiddenCount}) on the Archive page
          {openAppeals > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-bold text-amber-900 no-underline">
              {openAppeals} asking to look again
            </span>
          )}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <i aria-hidden="true" className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-500" />
          <input
            type="search"
            aria-label="Search reviews"
            placeholder="Search product, customer, text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${control} w-full pl-8`}
          />
        </div>
        <select aria-label="Filter by rating" value={rating} onChange={(e) => go({ rating: e.target.value })} className={control}>
          <option value="">All ratings</option>
          <option value="low">1–2 stars</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={String(n)}>
              {n} star{n === 1 ? '' : 's'}
            </option>
          ))}
        </select>
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-800 shadow-sm">
          <input type="checkbox" checked={unanswered} onChange={(e) => go({ unanswered: e.target.checked })} />
          Not replied
        </label>
        {product && (
          <button type="button" onClick={() => go({ product: undefined })} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-gray-900 px-2.5 text-xs font-medium text-white">
            <span className="max-w-[12rem] truncate">{product.title}</span>
            <i aria-hidden="true" className="fa-solid fa-xmark text-[10px]" />
            <span className="sr-only">Show all products</span>
          </button>
        )}
      </div>

      {message && (
        <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white transition-opacity ${isPending ? 'opacity-60' : ''}`}>
        {reviews.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">
            {filtered ? 'No reviews match these filters.' : 'No reviews yet. Customers can review a product once it’s delivered to them.'}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard
                  review={review}
                  onChanged={(updated) => setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
                  onRemoved={(id, text) => {
                    setReviews((prev) => prev.filter((r) => r.id !== id));
                    setMessage(text);
                    startTransition(() => router.refresh());
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {data.totalPages > 1 && (
        <nav aria-label="Review pages" className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Page {data.page} of {data.totalPages} · {data.total} reviews
          </span>
          <span className="flex gap-2">
            <button type="button" disabled={data.page <= 1} onClick={() => go({ page: data.page - 1 })} className={`${control} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
              Previous
            </button>
            <button type="button" disabled={data.page >= data.totalPages} onClick={() => go({ page: data.page + 1 })} className={`${control} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
              Next
            </button>
          </span>
        </nav>
      )}
    </div>
  );
}
