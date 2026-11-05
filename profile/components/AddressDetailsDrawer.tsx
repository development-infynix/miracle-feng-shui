'use client';

import React, { useId, useRef, useState } from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from '@/home/components/useGlassModal';
import type { AddressInput, AddressType } from '@/lib/address';
import { Field, FormError, focusRing, primaryButton, primaryLabel, secondaryButton, secondaryLabel } from './profileUi';

const TYPES: { value: AddressType; icon: string }[] = [
  { value: 'Home', icon: 'fa-house' },
  { value: 'Office', icon: 'fa-building' },
  { value: 'Other', icon: 'fa-location-dot' },
];

interface AddressFormProps {
  initial: AddressInput;
  formId: string;
  onSubmit: (address: AddressInput) => Promise<void>;
  onSavingChange: (saving: boolean) => void;
}

function AddressForm({ initial, formId, onSubmit, onSavingChange }: AddressFormProps) {
  const { t } = useLocale();
  const [address, setAddress] = useState(initial);
  const [error, setError] = useState('');

  const set = (field: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setAddress((current) => ({ ...current, [field]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSavingChange(true);
    setError('');
    try {
      await onSubmit({ ...address, line2: address.line2?.trim() || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.save_failed', "Couldn't save your details. Please try again."));
    } finally {
      onSavingChange(false);
    }
  };

  return (
    <form id={formId} onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      {error && <div className="sm:col-span-2"><FormError>{error}</FormError></div>}
      <fieldset className="sm:col-span-2">
        <legend className="font-outfit text-[13px] font-semibold text-[#431769]">{t('profile.address_type', 'Address type')}</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {TYPES.map(({ value, icon }) => {
            const selected = address.type === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setAddress((current) => ({ ...current, type: value }))}
                className={`group flex h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-md border bg-white/55 px-2 ${selected ? 'border-[#7A2FC0]' : 'border-white/70'} ${focusRing}`}
              >
                <i aria-hidden="true" className={`fa-solid ${icon} text-[12px] transition-colors group-hover:text-[#7A2FC0] ${selected ? 'text-[#7A2FC0]' : 'text-[#111111]'}`} />
                <span className={`truncate font-outfit text-[14px] font-medium transition-colors group-hover:text-[#7A2FC0] ${selected ? 'text-[#7A2FC0]' : 'text-[#111111]'}`}>
                  {t(`profile.type_${value.toLowerCase()}`, value)}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <Field id="address-name" label={t('profile.recipient', 'Recipient name')} autoComplete="name" value={address.name} onChange={set('name')} />
      <Field id="address-phone" label={t('profile.phone', 'Phone number')} type="tel" autoComplete="tel" value={address.phone} onChange={set('phone')} />
      <Field id="address-line1" className="sm:col-span-2" label={t('profile.line1', 'Flat, house no., building, street')} autoComplete="address-line1" value={address.line1} onChange={set('line1')} />
      <Field id="address-line2" className="sm:col-span-2" label={t('profile.line2', 'Area, landmark (optional)')} autoComplete="address-line2" value={address.line2 ?? ''} onChange={set('line2')} />
      <Field id="address-city" label={t('profile.city', 'City')} autoComplete="address-level2" value={address.city} onChange={set('city')} />
      <Field id="address-state" label={t('profile.state', 'State')} autoComplete="address-level1" value={address.state} onChange={set('state')} />
      <Field id="address-pincode" label={t('profile.pincode', 'Pincode')} autoComplete="postal-code" inputMode="numeric" value={address.pincode} onChange={set('pincode')} />
      <Field id="address-country" label={t('profile.country', 'Country')} autoComplete="country-name" value={address.country} onChange={set('country')} />
    </form>
  );
}

interface AddressDetailsDrawerProps {
  open: boolean;
  /** Whether this is a new address or an existing one. */
  editing: boolean;
  /** Changes each time the drawer opens, so the form always starts from `initial`. */
  formKey: number;
  initial: AddressInput;
  onClose: () => void;
  onSubmit: (address: AddressInput) => Promise<void>;
}

/** Adds or edits one address, in a glass drawer from the right. */
export default function AddressDetailsDrawer({ open, editing, formKey, initial, onClose, onSubmit }: AddressDetailsDrawerProps) {
  const { t } = useLocale();
  const panelRef = useRef<HTMLElement>(null);
  const formId = useId();
  const [saving, setSaving] = useState(false);
  const slidIn = useGlassModal({ open, onClose, panelRef, initialFocusRef: panelRef });
  const title = editing ? t('profile.edit_address', 'Edit address') : t('profile.add_address', 'Add address');

  return (
    <div inert={!open} className={`fixed inset-0 z-[9998] transition-[visibility] duration-300 ${open ? 'visible' : 'invisible'}`}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-[#2B154C]/25 backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none ${slidIn ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        // It takes focus on open for screen readers, and shows no ring because it isn't a control.
        style={{ outline: 'none' }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`glass-veil absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col overflow-hidden shadow-[-6px_0_24px_rgba(67,23,105,0.18),inset_2px_0_2px_rgba(255,255,255,0.7)] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${slidIn ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 pl-6 pr-3">
          <h2>
            <span className="block font-serif text-[24px] font-bold tracking-tight text-[#111111]">{title}</span>
          </h2>
          <button
            type="button"
            aria-label={t('auth.close', 'Close')}
            onClick={onClose}
            className={`group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ${focusRing}`}
          >
            <i aria-hidden="true" className="fa-solid fa-xmark text-[18px] text-[#111111] transition-colors group-hover:text-[#7A2FC0]" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-6 pb-6 pt-1">
          <AddressForm key={formKey} initial={initial} formId={formId} onSubmit={onSubmit} onSavingChange={setSaving} />
        </div>

        <footer className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] gap-3 border-t border-[#431769]/15 p-4">
          <button type="button" disabled={saving} onClick={onClose} className={secondaryButton}>
            <span className={secondaryLabel}>{t('profile.cancel', 'Cancel')}</span>
          </button>
          <button type="submit" form={formId} disabled={saving} className={primaryButton}>
            <span className={primaryLabel}>{saving ? t('profile.saving', 'Saving…') : t('profile.save_address', 'Save address')}</span>
          </button>
        </footer>
      </aside>
    </div>
  );
}
