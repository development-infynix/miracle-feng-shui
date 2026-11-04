'use client';

import React, { useEffect, useState } from 'react';
import { LuX } from 'react-icons/lu';
import type { UserRow } from '../types';

interface UserDetailDrawerProps {
  open: boolean;
  user: UserRow | null;
  onClose: () => void;
}

type TabKey = 'details' | 'favorites' | 'cart' | 'orders';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'details', label: 'Profile' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'cart', label: 'Cart' },
  { key: 'orders', label: 'Orders' },
];

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function money(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

function productImage(images: string[]): string {
  return images && images.length > 0 ? images[0] : '';
}

// Small square product thumbnail with a graceful fallback box.
function Thumb({ src, alt }: { src: string; alt: string }) {
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

export default function UserDetailDrawer({ open, user, onClose }: UserDetailDrawerProps) {
  const [tab, setTab] = useState<TabKey>('details');

  // Reset to the first tab whenever a different customer is opened.
  useEffect(() => {
    setTab('details');
  }, [user?.id]);

  if (!open || !user) return null;

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const infoRows: Array<[string, React.ReactNode]> = [
    ['Email', user.email],
    ['Phone', user.phone || '—'],
    ['Role', 'Customer'],
    ['Joined', formatDate(user.createdAt)],
    ['Orders', `${user._count.orders} placed`],
    ['Favorites', `${user.favorites.length}`],
    ['Saved addresses', `${user.addresses.length}`],
  ];

  const cartCount = user.cart?.items.reduce((sum, it) => sum + it.quantity, 0) ?? 0;
  const cartTotal =
    user.cart?.items.reduce((sum, it) => sum + (it.product ? it.product.price * it.quantity : 0), 0) ?? 0;
  const ordersTotal = user.orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Customer details"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-[#fafaf9] shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Tab bar with the close button docked at the end */}
        <header className="shrink-0 border-b border-stone-200 bg-white">
          <div
            role="tablist"
            aria-label="Customer sections"
            className="flex items-end gap-1 overflow-x-auto px-3 pt-1.5 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setTab(t.key)}
                  className={`-mb-px inline-flex items-center gap-1 border-b-2 px-2 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors cursor-pointer sm:px-3 sm:text-xs ${
                    active
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close customer details"
              className="ml-auto mb-1.5 mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            >
              <LuX className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          {/* ---------------- Customer Details ---------------- */}
          {tab === 'details' && (
            <>
              {/* Identity card: name over email, top of the Customer Details tab */}
              <section className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-stone-100 border border-stone-200 text-base font-bold text-stone-700">
                  {initials || <i className="fa-solid fa-user text-stone-400" />}
                </div>
                <div className="min-w-0">
                  <h4 className="truncate font-bold text-stone-900 text-lg leading-snug" title={user.name}>
                    {user.name}
                  </h4>
                  <p className="truncate text-sm text-stone-500" title={user.email}>
                    {user.email}
                  </p>
                </div>
              </section>

              <section>
                <dl className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white px-4">
                  {infoRows.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[5.5rem_1fr] items-center gap-3 py-3 text-sm sm:grid-cols-[9rem_1fr]">
                      <dt className="text-stone-500">{label}</dt>
                      {/* min-w-0 lets the 1fr column shrink so long emails wrap
                      instead of overflowing (grid items default to min-width:auto) */}
                      <dd className="min-w-0 font-medium text-stone-900 break-words">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <h5 className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                  Address Details
                </h5>
                {user.addresses.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-stone-300 bg-white px-4 py-6 text-center text-sm text-stone-400">
                    No saved addresses.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {user.addresses.map((addr) => (
                      <div key={addr.id} className="rounded-lg border border-stone-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-stone-900">
                            <i className="fa-solid fa-location-dot text-stone-400 text-xs" />
                            <span className="truncate" title={addr.name}>{addr.name}</span>
                          </span>
                          {addr.isDefault && (
                            <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-stone-700">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ''}
                          <br />
                          {addr.city}, {addr.state} {addr.pincode}
                          <br />
                          {addr.country}
                        </p>
                        <p className="mt-1.5 text-xs text-stone-500">
                          <i className="fa-solid fa-phone mr-1.5 text-[10px]" />
                          {addr.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* ---------------- Favorites ---------------- */}
          {tab === 'favorites' && (
            <section>
              {user.favorites.length === 0 ? (
                <EmptyState icon="fa-regular fa-heart" text="No favorites yet." />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {user.favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3"
                    >
                      <Thumb src={productImage(fav.product.images)} alt={fav.product.title} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-stone-900" title={fav.product.title}>
                          {fav.product.title}
                        </p>
                        <p className="text-xs text-stone-500">Added {formatDate(fav.createdAt)}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-stone-900">{money(fav.product.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ---------------- Cart ---------------- */}
          {tab === 'cart' && (
            <section>
              {!user.cart || user.cart.items.length === 0 ? (
                <EmptyState icon="fa-solid fa-cart-shopping" text="Cart is empty." />
              ) : (
                <>
                  <div className="flex flex-col gap-2.5">
                    {user.cart.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3"
                      >
                        <Thumb
                          src={item.product ? productImage(item.product.images) : ''}
                          alt={item.product?.title ?? 'Product'}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-stone-900" title={item.product?.title}>
                            {item.product?.title ?? 'Product no longer available'}
                          </p>
                          <p className="text-xs text-stone-500">
                            Qty {item.quantity}
                            {item.product ? ` · ${money(item.product.price)} each` : ''}
                          </p>
                        </div>
                        {item.product && (
                          <span className="shrink-0 text-sm font-bold text-stone-900">
                            {money(item.product.price * item.quantity)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {/* ---------------- Orders ---------------- */}
          {tab === 'orders' && (
            <section>
              {user.orders.length === 0 ? (
                <EmptyState icon="fa-solid fa-box" text="No orders yet." />
              ) : (
                <div className="flex flex-col gap-3">
                  {user.orders.map((order) => (
                    <div key={order.id} className="rounded-lg border border-stone-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-stone-900">#{order.orderNumber}</p>
                          <p className="text-xs text-stone-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-600">
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 border-t border-stone-100 pt-2">
                        {order.items.map((it) => (
                          <div key={it.id} className="flex items-center gap-2 text-xs text-stone-700">
                            <Thumb src={it.image} alt={it.title} />
                            <span className="min-w-0 flex-1 truncate" title={it.title}>{it.title}</span>
                            <span className="text-stone-500">× {it.quantity}</span>
                            <span className="font-semibold tabular-nums">{money(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-stone-100 pt-2 text-sm">
                        <span className="text-stone-500">Total</span>
                        <span className="font-bold text-stone-900">{money(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Contextual footer: shows a summary only for tabs that have one.
        The Cart tab reports item count + subtotal here instead of in the body. */}
        {tab === 'cart' && user.cart && user.cart.items.length > 0 && (
          <footer className="flex shrink-0 items-center justify-between border-t border-stone-200 bg-[#fafaf9] px-5 py-4">
            <span className="text-sm text-stone-500">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
            <span className="flex items-center gap-2 text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-bold text-stone-900">{money(cartTotal)}</span>
            </span>
          </footer>
        )}

        {/* Profile footer: placeholder Deactivate action, not wired up yet. */}
        {tab === 'details' && (
          <footer className="flex shrink-0 items-center justify-end border-t border-stone-200 bg-[#fafaf9] px-5 py-3">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 cursor-pointer"
            >
              Deactivate
            </button>
          </footer>
        )}

        {tab === 'orders' && user.orders.length > 0 && (
          <footer className="flex shrink-0 items-center justify-between border-t border-stone-200 bg-[#fafaf9] px-5 py-4">
            <span className="text-sm text-stone-500">
              {user.orders.length} {user.orders.length === 1 ? 'order' : 'orders'}
            </span>
            <span className="flex items-center gap-2 text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-bold text-stone-900">{money(ordersTotal)}</span>
            </span>
          </footer>
        )}
      </aside>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white px-4 py-10 text-center">
      <i className={`${icon} mb-2 text-lg text-stone-300`} aria-hidden="true" />
      <p className="text-sm text-stone-400">{text}</p>
    </div>
  );
}
