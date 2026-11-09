'use client';

import React, { useState } from 'react';
import type { CustomerProfile, UserRow } from '../../types';
import { useCustomerSection } from './useCustomerSection';
import { EmptyState, formatDate, TabBody, TabError, TabLoading } from './shared';

export default function ProfileTab({
  user,
  onStatusChange,
}: {
  user: UserRow;
  onStatusChange: (deactivatedAt: string | null) => void;
}) {
  const { state, retry } = useCustomerSection<CustomerProfile>(user.id);
  const profile = state.status === 'ready' ? state.data : null;
  const deactivated = Boolean(user.deactivatedAt);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setActive = async (active: boolean) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'request failed');
      setConfirming(false);
      onStatusChange(json.data.deactivatedAt ?? null);
    } catch {
      setError(active ? "Couldn't reactivate this customer. Try again." : "Couldn't deactivate this customer. Try again.");
    } finally {
      setSaving(false);
    }
  };

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
    [
      'Status',
      deactivated ? (
        <span className="text-red-700">Deactivated on {formatDate(user.deactivatedAt as string)}</span>
      ) : (
        <span className="text-emerald-700">Active</span>
      ),
    ],
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

      {/* Deactivate asks first; Reactivate doesn't, since it only gives access back. */}
      <footer className="shrink-0 border-t border-stone-200 bg-[#fafaf9] px-5 py-3">
        {error && (
          <p role="alert" className="mb-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}
        {confirming ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-stone-700">
              Deactivate <strong>{user.name}</strong>? They&rsquo;ll be signed out and can&rsquo;t sign in until you reactivate them.
              Their orders stay, and orders already placed still go out.
            </p>
            <div className="flex shrink-0 justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirming(false)}
                className="inline-flex items-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void setActive(false)}
                className="inline-flex items-center rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end">
            {deactivated ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => void setActive(true)}
                className="inline-flex items-center rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Reactivating…' : 'Reactivate'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setConfirming(true);
                }}
                className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 cursor-pointer"
              >
                Deactivate
              </button>
            )}
          </div>
        )}
      </footer>
    </>
  );
}
