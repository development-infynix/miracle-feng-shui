'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/context/CurrencyContext';
import {
  card,
  CardHeading,
  Detail,
  Field,
  FormError,
  FormSuccess,
  primaryButton,
  primaryLabel,
  secondaryButton,
  secondaryLabel,
  smallButton,
  smallLabel,
} from './profileUi';
import type { CustomerProfile } from './ProfileView';

export default function AccountDetailsCard({ profile, onSaved }: {
  profile: CustomerProfile;
  onSaved: (changes: Pick<CustomerProfile, 'name' | 'phone'>) => void;
}) {
  const { update } = useSession();
  const { t } = useLocale();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const startEditing = () => {
    setName(profile.name);
    setPhone(profile.phone ?? '');
    setError('');
    setSaved(false);
    setEditing(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.details?.[0]?.message || json.error || t('profile.save_failed', "Couldn't save your details. Please try again."));
        return;
      }
      onSaved({ name: json.data.name, phone: json.data.phone });
      setEditing(false);
      setSaved(true);
      // Puts the new name in the session, so the navbar shows it straight away.
      await update();
    } catch {
      setError(t('profile.save_failed', "Couldn't save your details. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="account-details" className={card}>
      <span id="account-details" className="sr-only">{t('profile.account_details', 'Account details')}</span>
      <CardHeading
        action={
          !editing && (
            <button type="button" onClick={startEditing} className={smallButton}>
              <i aria-hidden="true" className="fa-solid fa-pen text-[12px] text-[#431769] transition-colors group-hover:text-[#7A2FC0]" />
              <span className={smallLabel}>{t('profile.edit', 'Edit')}</span>
            </button>
          )
        }
      >
        {t('profile.account_details', 'Account details')}
      </CardHeading>

      {editing ? (
        <form onSubmit={save} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="profile-name" label={t('profile.name', 'Name')} autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Field id="profile-phone" label={t('profile.phone', 'Phone number')} type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Field
            id="profile-email"
            className="sm:col-span-2"
            label={t('profile.email', 'Email')}
            type="email"
            value={profile.email}
            disabled
            hint={t('profile.email_locked', "Your email can't be changed.")}
          />
          {error && <div className="sm:col-span-2"><FormError>{error}</FormError></div>}
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" disabled={saving} className={primaryButton}>
              <span className={primaryLabel}>{saving ? t('profile.saving', 'Saving…') : t('profile.save', 'Save changes')}</span>
            </button>
            <button type="button" disabled={saving} onClick={() => setEditing(false)} className={secondaryButton}>
              <span className={secondaryLabel}>{t('profile.cancel', 'Cancel')}</span>
            </button>
          </div>
        </form>
      ) : (
        <>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail label={t('profile.name', 'Name')} value={profile.name} />
            <Detail label={t('profile.phone', 'Phone number')} value={profile.phone || t('profile.not_added', 'Not added')} />
            <Detail
              className="sm:col-span-2"
              label={t('profile.email', 'Email')}
              value={
                <span className="flex items-center gap-2">
                  <span className="min-w-0 break-all">{profile.email}</span>
                  <i aria-hidden="true" title={t('profile.email_locked', "Your email can't be changed.")} className="fa-solid fa-lock text-[12px] text-[#5B4A70]" />
                </span>
              }
            />
          </dl>
          {saved && <div className="mt-4"><FormSuccess>{t('profile.details_saved', 'Your details have been saved.')}</FormSuccess></div>}
        </>
      )}
    </section>
  );
}
