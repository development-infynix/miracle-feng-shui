'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { canResizeImage } from '@/lib/images';
import Alert from '@/app/components/alert';
import ViewOrderDrawer from '../orders/components/ViewOrderDrawer';
import type { OrderItemData } from '../orders/types';
import ReviewCard from '../reviews/components/ReviewCard';
import type { AdminReview, AdminReviewPage } from '../reviews/types';

export interface ArchivedProduct {
  id: string;
  name: string;
  images: string[];
  price: number;
  category: string;
  stock: number;
  archivedAt: string | null;
  /** When it can be deleted for good: two weeks after it was archived. */
  deletableAt: string | null;
}

export type ArchiveTab = 'orders' | 'products' | 'reviews';
type Tab = ArchiveTab;

interface ArchiveClientProps {
  tab: Tab;
  orders: OrderItemData[];
  products: ArchivedProduct[];
  /** All archived products, which can be more than the first page shown. */
  productTotal: number;
  /** Hidden reviews, one page at a time. */
  reviewPage: AdminReviewPage;
}

const day = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function ArchiveClient({ tab: initialTab, orders: initialOrders, products: initialProducts, productTotal, reviewPage }: ArchiveClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [reviews, setReviews] = useState<AdminReview[]>(reviewPage.items);
  const [viewOrder, setViewOrder] = useState<OrderItemData | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // The product whose delete is waiting for confirmation.
  const [confirmDelete, setConfirmDelete] = useState<ArchivedProduct | null>(null);
  // Read once per render of the list; the dates are days apart, so a stale clock doesn't matter.
  const [now] = useState(() => Date.now());
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => setOrders(initialOrders), [initialOrders]);
  useEffect(() => setProducts(initialProducts), [initialProducts]);
  useEffect(() => setReviews(reviewPage.items), [reviewPage.items]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  const chooseTab = (next: Tab) => {
    setTab(next);
    router.replace(next === 'orders' ? '/admin/archive' : `/admin/archive?tab=${next}`, { scroll: false });
  };

  const restoreProduct = async (product: ArchivedProduct) => {
    setRestoringId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "Couldn't restore the product.");
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setMessage({ text: `${product.name} is active again and back in the store.` });
      startTransition(() => router.refresh());
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Couldn't restore the product.", error: true });
    } finally {
      setRestoringId(null);
    }
  };

  const deleteProduct = async (product: ArchivedProduct) => {
    setDeletingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/permanent`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "Couldn't delete the product.");
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setMessage({ text: data.data?.message || `${product.name} was deleted for good.` });
      startTransition(() => router.refresh());
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Couldn't delete the product.", error: true });
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'orders', label: 'Orders', count: orders.length },
    { id: 'products', label: 'Products', count: Math.max(productTotal - (initialProducts.length - products.length), 0) },
    { id: 'reviews', label: 'Reviews', count: Math.max(reviewPage.total - (reviewPage.items.length - reviews.length), 0) },
  ];

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }} className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Archive</h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Finished orders, retired products and hidden reviews, kept for their history. Restore anything to bring it back. Products can be deleted for good two weeks after they&apos;re archived.
        </p>
      </div>

      <div role="tablist" aria-label="Archived items" className="flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`archive-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`archive-panel-${t.id}`}
            onClick={() => chooseTab(t.id)}
            className={`-mb-px cursor-pointer border-b-2 px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
              tab === t.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label} <span className="ml-1 tabular-nums text-xs font-medium text-gray-500">{t.count}</span>
          </button>
        ))}
      </div>

      {message && (
        <p
          role={message.error ? 'alert' : 'status'}
          className={`rounded-md border px-3 py-2 text-sm ${message.error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}
        >
          {message.text}
        </p>
      )}

      {tab === 'orders' ? (
        <section id="archive-panel-orders" role="tabpanel" aria-labelledby="archive-tab-orders">
          {orders.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
              No archived orders. Archive a delivered or fully refunded order from its details on the Orders page.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {orders.map((order) => (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => setViewOrder(order)}
                    className="flex w-full cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gray-900"
                  >
                    <span className="min-w-0 flex-1 basis-48">
                      <span className="block font-mono text-[11px] font-semibold text-gray-900">#{order.orderNumber}</span>
                      <span className="block truncate text-gray-500">{order.customerName}</span>
                    </span>
                    <span className="w-36 shrink-0">{order.status}</span>
                    <span className="w-20 shrink-0 font-semibold tabular-nums text-gray-900">{rupees(order.totalAmount)}</span>
                    <span className="w-32 shrink-0 text-gray-500">{order.archivedAt ? `Archived ${day(order.archivedAt)}` : ''}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : tab === 'reviews' ? (
        <section id="archive-panel-reviews" role="tabpanel" aria-labelledby="archive-tab-reviews">
          {reviews.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
              No hidden reviews. Hide a review from the Reviews page and it comes here, where you can restore it.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {reviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard
                    review={review}
                    onChanged={(updated) => setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
                    onRemoved={(id, text) => {
                      setReviews((prev) => prev.filter((r) => r.id !== id));
                      setMessage({ text });
                      startTransition(() => router.refresh());
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
          {reviewPage.totalPages > 1 && (
            <nav aria-label="Hidden review pages" className="mt-2 flex items-center justify-between text-xs text-gray-600">
              <span>
                Page {reviewPage.page} of {reviewPage.totalPages}
              </span>
              <span className="flex gap-3">
                {reviewPage.page > 1 && (
                  <a href={`/admin/archive?tab=reviews&page=${reviewPage.page - 1}`} className="font-medium underline-offset-2 hover:underline">
                    Previous
                  </a>
                )}
                {reviewPage.page < reviewPage.totalPages && (
                  <a href={`/admin/archive?tab=reviews&page=${reviewPage.page + 1}`} className="font-medium underline-offset-2 hover:underline">
                    Next
                  </a>
                )}
              </span>
            </nav>
          )}
        </section>
      ) : (
        <section id="archive-panel-products" role="tabpanel" aria-labelledby="archive-tab-products">
          {products.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
              No archived products. Archive a product from its details on the Products page.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {products.map((product) => {
                const image = product.images?.[0];
                const deletableAt = product.deletableAt ? new Date(product.deletableAt) : null;
                const canDelete = deletableAt !== null && deletableAt.getTime() <= now;
                const busy = restoringId === product.id || deletingId === product.id;
                return (
                  <li key={product.id} className="flex items-center gap-3 px-4 py-3 text-xs text-gray-700">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {image && (
                        <Image src={image} alt="" fill sizes="48px" unoptimized={!canResizeImage(image)} className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900" title={product.name}>
                        {product.name}
                      </p>
                      <p className="truncate text-gray-500">
                        {product.category} · {rupees(product.price)} · {product.stock} in stock
                      </p>
                      {product.archivedAt && (
                        <p className="truncate text-gray-500">
                          Archived {day(product.archivedAt)}
                          {deletableAt && !canDelete ? ` · can be deleted from ${day(deletableAt.toISOString())}` : ''}
                        </p>
                      )}
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(product)}
                        disabled={busy}
                        aria-label={`Delete ${product.name} for good`}
                        className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                      >
                        <i aria-hidden="true" className="fa-solid fa-trash-can text-[11px]" />
                        {deletingId === product.id ? 'Deleting…' : 'Delete'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void restoreProduct(product)}
                      disabled={busy}
                      aria-label={`Restore ${product.name}`}
                      className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60"
                    >
                      <i aria-hidden="true" className="fa-solid fa-rotate-left text-[11px]" />
                      {restoringId === product.id ? 'Restoring…' : 'Restore'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {productTotal > initialProducts.length && (
            <p className="mt-2 text-xs text-gray-500">Showing the first {initialProducts.length} of {productTotal}.</p>
          )}
        </section>
      )}

      <Alert
        open={confirmDelete !== null}
        tone="danger"
        title={confirmDelete ? `Delete “${confirmDelete.name}” for good?` : 'Delete for good?'}
        description="This can't be undone."
        onClose={() => !deletingId && setConfirmDelete(null)}
        actions={[
          { label: 'Keep it', onClick: () => setConfirmDelete(null), variant: 'default', disabled: Boolean(deletingId) },
          {
            label: deletingId ? 'Deleting…' : 'Delete for good',
            onClick: () => confirmDelete && void deleteProduct(confirmDelete),
            variant: 'danger',
            disabled: Boolean(deletingId),
          },
        ]}
      >
        <div className="space-y-2 text-xs leading-relaxed text-stone-700">
          <p>
            <span className="font-semibold text-stone-900">Removed:</span> the product, its reviews, favourites and cart entries,
            and its photos where nothing else uses them.
          </p>
          <p>
            <span className="font-semibold text-stone-900">Kept:</span> past orders and invoices, with their own copy of its name,
            price and photo. Customers see it there as no longer available.
          </p>
        </div>
      </Alert>

      {viewOrder && (
        <ViewOrderDrawer
          key={viewOrder.id}
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onSaved={(updated) => setViewOrder(updated)}
          onArchiveChanged={(orderId) => {
            setViewOrder(null);
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
            setMessage({ text: 'Order restored. It’s back on the Orders page.' });
            startTransition(() => router.refresh());
          }}
        />
      )}
    </div>
  );
}
