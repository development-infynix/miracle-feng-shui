'use client';

import React, { useState } from 'react';
import { LuX } from 'react-icons/lu';
import type { UserRow } from '../types';
import ProfileTab from './tabs/ProfileTab';
import FavoritesTab from './tabs/FavoritesTab';
import CartTab from './tabs/CartTab';
import OrdersTab from './tabs/OrdersTab';

interface UserDetailDrawerProps {
  user: UserRow;
  onClose: () => void;
  /** Called after the customer is deactivated (a date) or reactivated (null). */
  onStatusChange: (deactivatedAt: string | null) => void;
}

type TabKey = 'details' | 'favorites' | 'cart' | 'orders';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'details', label: 'Profile' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'cart', label: 'Cart' },
  { key: 'orders', label: 'Orders' },
];

export default function UserDetailDrawer({ user, onClose, onStatusChange }: UserDetailDrawerProps) {
  const [tab, setTab] = useState<TabKey>('details');
  // A tab mounts (and fetches) the first time it's opened, then stays mounted but
  // hidden, so going back to it keeps its data and scroll position.
  const [visited, setVisited] = useState<ReadonlySet<TabKey>>(() => new Set<TabKey>(['details']));

  const selectTab = (key: TabKey) => {
    setTab(key);
    setVisited((prev) => new Set(prev).add(key));
  };

  const panels: Record<TabKey, React.ReactNode> = {
    details: <ProfileTab user={user} onStatusChange={onStatusChange} />,
    favorites: <FavoritesTab userId={user.id} />,
    cart: <CartTab userId={user.id} />,
    orders: <OrdersTab userId={user.id} />,
  };

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
                  id={`customer-tab-${t.key}`}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  aria-controls={visited.has(t.key) ? `customer-panel-${t.key}` : undefined}
                  onClick={() => selectTab(t.key)}
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

        {TABS.filter((t) => visited.has(t.key)).map((t) => (
          <div
            key={t.key}
            id={`customer-panel-${t.key}`}
            role="tabpanel"
            aria-labelledby={`customer-tab-${t.key}`}
            className={tab === t.key ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}
          >
            {panels[t.key]}
          </div>
        ))}
      </aside>
    </div>
  );
}
