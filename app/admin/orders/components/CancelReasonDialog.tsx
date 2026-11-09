'use client';

import React, { useEffect, useId, useState } from 'react';
import Alert from '@/app/components/alert';

// What the customer reads when they open their cancelled order, so they're written to the customer.
const PRESETS = [
  { id: 'stock', label: 'Item out of stock', text: 'An item in your order went out of stock, so we couldn’t send it.' },
  { id: 'address', label: 'Unable to deliver to this address', text: 'We weren’t able to deliver to your address.' },
  { id: 'payment', label: 'Payment couldn’t be verified', text: 'We couldn’t verify the payment for this order.' },
  { id: 'other', label: 'Other', text: '' },
] as const;

const MAX_LENGTH = 300;

interface CancelReasonDialogProps {
  open: boolean;
  orderNumber: string;
  /** Whether a reason must be given (the customer didn't ask to cancel). */
  required: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (note: string) => void;
}

/** Asks why the store is cancelling an order. The reason is shown to the customer and kept in the history. */
export default function CancelReasonDialog({ open, orderNumber, required, busy = false, onCancel, onConfirm }: CancelReasonDialogProps) {
  const [preset, setPreset] = useState<(typeof PRESETS)[number]['id'] | ''>('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const name = useId();

  // Each time it opens, it starts empty.
  useEffect(() => {
    if (open) {
      setPreset('');
      setDetails('');
      setError('');
    }
  }, [open]);

  const note = [PRESETS.find((p) => p.id === preset)?.text, details.trim()].filter(Boolean).join(' ').slice(0, MAX_LENGTH);

  const confirm = () => {
    if (preset === 'other' && !details.trim()) {
      setError('Write the reason for the customer.');
      return;
    }
    if (required && !note) {
      setError('Choose a reason, so the customer knows why.');
      return;
    }
    onConfirm(note);
  };

  return (
    <Alert
      open={open}
      tone="danger"
      title={`Cancel order #${orderNumber}?`}
      description="The customer sees this reason when they open the order."
      onClose={() => !busy && onCancel()}
      actions={[
        { label: 'Keep order', onClick: onCancel, variant: 'default', disabled: busy },
        { label: busy ? 'Cancelling…' : 'Cancel order', onClick: confirm, variant: 'danger', disabled: busy },
      ]}
    >
      <fieldset className="space-y-1.5">
        <legend className="mb-1 text-xs font-semibold text-stone-600">
          Reason{required ? '' : ' (optional)'}
        </legend>
        {PRESETS.map((option) => (
          <label key={option.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm text-stone-800 hover:bg-stone-50">
            <input
              type="radio"
              name={name}
              checked={preset === option.id}
              disabled={busy}
              onChange={() => {
                setPreset(option.id);
                setError('');
              }}
              className="h-4 w-4 accent-stone-900"
            />
            {option.label}
          </label>
        ))}
      </fieldset>
      <label className="mt-3 block text-xs font-semibold text-stone-600">
        {preset === 'other' ? 'Reason for the customer' : 'Anything to add for the customer (optional)'}
        <textarea
          value={details}
          disabled={busy}
          maxLength={MAX_LENGTH}
          rows={2}
          onChange={(e) => {
            setDetails(e.target.value);
            setError('');
          }}
          className="mt-1 block w-full resize-none rounded-md border border-stone-300 px-2.5 py-1.5 text-sm font-normal text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </Alert>
  );
}
