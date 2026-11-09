'use client';

import React, { useEffect, useState } from 'react';
import Alert from '@/app/components/alert';

/**
 * The store-wide switch for whether customers can cancel orders. It applies to orders placed from
 * now on: each existing order keeps the setting it was bought under. Asks before changing it.
 */
export default function CancellationSettingToggle() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/settings', { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setAllowed(Boolean(json.data.cancellationAllowed));
        else setError("Couldn't load the cancellation setting.");
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("Couldn't load the cancellation setting.");
      });
    return () => controller.abort();
  }, []);

  const save = async () => {
    if (allowed === null) return;
    const next = !allowed;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationAllowed: next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error();
      setAllowed(Boolean(json.data.cancellationAllowed));
      setConfirming(false);
    } catch {
      setError("Couldn't save the cancellation setting. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const label = allowed === null ? 'Order cancellation' : `Order cancellation: ${allowed ? 'On' : 'Off'}`;

  return (
    <div className="relative">
      <button
        type="button"
        role="switch"
        aria-checked={allowed ?? false}
        aria-label={label}
        disabled={allowed === null}
        onClick={() => setConfirming(true)}
        title={allowed === null ? 'Loading…' : allowed ? 'Customers can cancel orders before they ship' : 'Customers can’t cancel orders'}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
      >
        <span className="hidden sm:inline">Cancellation</span>
        <span
          aria-hidden="true"
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${allowed ? 'bg-emerald-600' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${allowed ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
        </span>
      </button>
      {error && !confirming && (
        <p role="alert" className="absolute right-0 top-full z-10 mt-1 w-56 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700">
          {error}
        </p>
      )}

      <Alert
        open={confirming}
        tone={allowed ? 'warning' : 'info'}
        title={allowed ? 'Turn off order cancellation?' : 'Turn on order cancellation?'}
        description={
          allowed
            ? 'New orders won’t be cancellable. Customers are told before they pay, and invoices for those orders say so. Orders already placed keep the setting they were bought under. Damaged or wrong items are still replaced.'
            : 'Customers will be able to cancel new orders before they ship. Orders placed while cancellation was off stay non-cancellable.'
        }
        onClose={() => !saving && setConfirming(false)}
        actions={[
          { label: 'Keep as is', onClick: () => setConfirming(false), variant: 'default', disabled: saving },
          { label: saving ? 'Saving…' : allowed ? 'Turn off' : 'Turn on', onClick: () => void save(), variant: allowed ? 'danger' : 'primary', disabled: saving },
        ]}
      >
        {error && confirming && <p className="text-xs font-medium text-red-700">{error}</p>}
      </Alert>
    </div>
  );
}
