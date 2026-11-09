'use client';

import React, { useEffect, useId, useState } from 'react';

interface HistoryEntry {
  id: string;
  from: string | null;
  to: string;
  actor: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
  by: string | null;
  note: string | null;
  at: string;
}

const ACTOR_LABEL: Record<HistoryEntry['actor'], string> = {
  CUSTOMER: 'Customer',
  ADMIN: 'Admin',
  SYSTEM: 'System',
};

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });

/**
 * Every status change on the order, oldest first: what it changed from and to, when, and who did it.
 * Collapsed until opened, and only loaded then. Reloads when the status changes while it's open.
 */
export default function OrderHistory({ orderId, status }: { orderId: string; status: string }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setFailed(false);
    fetch(`/api/admin/orders/${orderId}/history`, { signal: controller.signal })
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok || !json.success) throw new Error();
        setEntries(json.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [open, orderId, status, attempt]);

  return (
    <section>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between rounded-md py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">History</span>
        <i
          aria-hidden="true"
          className={`fa-solid fa-chevron-right text-[11px] text-stone-500 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-90' : ''}`}
        />
      </button>
      <div id={panelId} hidden={!open} className="mt-2 rounded-lg border border-stone-200 bg-white px-4 py-3">
        {failed ? (
          <p role="alert" className="text-sm text-stone-600">
            Couldn&rsquo;t load the history.{' '}
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className="font-semibold text-stone-900 underline cursor-pointer">
              Try again
            </button>
          </p>
        ) : entries === null ? (
          <p aria-busy="true" className="text-sm text-stone-500">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-stone-500">No changes recorded yet.</p>
        ) : (
          <ol className="relative space-y-3 border-l border-stone-200 pl-4">
            {entries.map((entry) => (
              <li key={entry.id} className="relative text-sm">
                <span aria-hidden="true" className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-stone-400" />
                <p className="font-medium text-stone-900">
                  {entry.from ? (
                    <>
                      {entry.from} <span className="text-stone-400">&rarr;</span> {entry.to}
                    </>
                  ) : (
                    entry.to
                  )}
                </p>
                <p className="text-xs text-stone-500">
                  {when(entry.at)} &middot; {ACTOR_LABEL[entry.actor]}
                  {entry.by ? ` (${entry.by})` : ''}
                </p>
                {entry.note && <p className="mt-0.5 whitespace-pre-wrap break-words text-xs text-stone-600">{entry.note}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
