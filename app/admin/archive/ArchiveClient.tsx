'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { canResizeImage } from '@/lib/images';
import ViewOrderDrawer from '../orders/components/ViewOrderDrawer';
import type { OrderItemData } from '../orders/types';

export interface ArchivedProduct {
  id: string;
  name: string;
  images: string[];
  price: number;
  category: string;
  stock: number;
}

type Tab = 'orders' | 'products';

interface ArchiveClientProps {
  tab: Tab;
  orders: OrderItemData[];
  products: ArchivedProduct[];
  /** All archived products, which can be more than the first page shown. */
  productTotal: number;
}

const day = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function ArchiveClient({ tab: initialTab, orders: initialOrders, products: initialProducts, productTotal }: ArchiveClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [viewOrder, setViewOrder] = useState<OrderItemData | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => setOrders(initialOrders), [initialOrders]);
  useEffect(() => setProducts(initialProducts), [initialProducts]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  const chooseTab = (next: Tab) => {
    setTab(next);
    router.replace(next === 'products' ? '/admin/archive?tab=products' : '/admin/archive', { scroll: false });
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

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'orders', label: 'Orders', count: orders.length },
    { id: 'products', label: 'Products', count: Math.max(productTotal - (initialProducts.length - products.length), 0) },
  ];

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }} className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Archive</h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Finished orders and retired products, kept for their history and invoices. Nothing here is deleted; restore anything to bring it back.
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
      ) : (
        <section id="archive-panel-products" role="tabpanel" aria-labelledby="archive-tab-products">
          {products.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
              No archived products. A product that&rsquo;s in past orders is archived instead of deleted.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {products.map((product) => {
                const image = product.images?.[0];
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
                    </div>
                    <button
                      type="button"
                      onClick={() => void restoreProduct(product)}
                      disabled={restoringId === product.id}
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
