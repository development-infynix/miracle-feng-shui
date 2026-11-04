'use client';

import React from 'react';

export function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function money(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function productImage(images: string[]): string {
  return images && images.length > 0 ? images[0] : '';
}

// Scrolling content area. A tab's footer sits after this, outside the scroll.
export function TabBody({ children }: { children: React.ReactNode }) {
  return <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">{children}</div>;
}

// Small square product thumbnail with a graceful fallback box.
export function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-100">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-stone-300">
          <i className="fa-regular fa-image text-sm" />
        </div>
      )}
    </div>
  );
}

export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white px-4 py-10 text-center">
      <i className={`${icon} mb-2 text-lg text-stone-300`} aria-hidden="true" />
      <p className="text-sm text-stone-400">{text}</p>
    </div>
  );
}

export function TabLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-label={`Loading ${label}`} className="flex flex-col gap-2.5">
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-[74px] animate-pulse rounded-lg border border-stone-200 bg-white p-3">
          <div className="flex h-full items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-md bg-stone-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 rounded bg-stone-100" />
              <div className="h-3 w-1/3 rounded bg-stone-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface LoadMoreProps {
  shown: number;
  total: number;
  loading: boolean;
  failed: boolean;
  onLoadMore: () => void;
}

export function LoadMore({ shown, total, loading, failed, onLoadMore }: LoadMoreProps) {
  return (
    <div className="flex flex-col items-center gap-2 pt-1">
      <p className="text-xs text-stone-500 tabular-nums">
        Showing {shown} of {total}
      </p>
      {failed && (
        <p role="alert" className="text-xs text-red-600">
          Couldn&apos;t load more. Please try again.
        </p>
      )}
      <button
        type="button"
        onClick={onLoadMore}
        disabled={loading}
        className="inline-flex items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 cursor-pointer disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? 'Loading…' : 'Load more'}
      </button>
    </div>
  );
}

export function TabError({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-stone-200 bg-white px-4 py-8 text-center">
      <p className="text-sm text-stone-600">Couldn&apos;t load {label}.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
