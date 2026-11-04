'use client';

import React from 'react';
import type { CustomerProfile, UserRow } from '../../types';
import { useCustomerSection } from './useCustomerSection';
import { EmptyState, formatDate, TabBody, TabError, TabLoading } from './shared';

export default function ProfileTab({ user }: { user: UserRow }) {
  const { state, retry } = useCustomerSection<CustomerProfile>(user.id);
  const profile = state.status === 'ready' ? state.data : null;

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // The list row already has the basics, so they show at once. Only the counts
  // and addresses wait on the request.
  const pending = state.status === 'loading' ? '…' : '—';
  const infoRows: Array<[string, React.ReactNode]> = [
    ['Email', user.email],
    ['Phone', user.phone || '—'],
    ['Role', 'Customer'],
    ['Joined', formatDate(user.createdAt)],
    ['Orders', `${user._count.orders} placed`],
    ['Favorites', profile ? `${profile._count.favorites}` : pending],
    ['Saved addresses', profile ? `${profile.addresses.length}` : pending],
  ];

  return (
    <>
      <TabBody>
        {/* Identity card: name over email */}
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
          {state.status === 'loading' && <TabLoading label="addresses" />}
          {state.status === 'error' && <TabError label="addresses" onRetry={retry} />}
          {profile && profile.addresses.length === 0 && (
            <EmptyState icon="fa-solid fa-location-dot" text="No saved addresses." />
          )}
          {profile && profile.addresses.length > 0 && (
            <div className="flex flex-col gap-3">
              {profile.addresses.map((addr) => (
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
      </TabBody>

      {/* Placeholder Deactivate action, not wired up yet. */}
      <footer className="flex shrink-0 items-center justify-end border-t border-stone-200 bg-[#fafaf9] px-5 py-3">
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 cursor-pointer"
        >
          Deactivate
        </button>
      </footer>
    </>
  );
}
