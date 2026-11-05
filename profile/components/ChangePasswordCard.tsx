'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/context/CurrencyContext';
import {
  card,
  CardHeading,
  Field,
  FormError,
  FormSuccess,
  primaryButton,
  primaryLabel,
  secondaryButton,
  secondaryLabel,
  textButton,
  textLabel,
} from './profileUi';

const MIN_LENGTH = 6;

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.details?.[0]?.message || json.error || 'Something went wrong. Please try again.');
  }
}

/** Step one proves the current password, which unlocks step two. The server checks it again on save. */
export default function ChangePasswordCard() {
  const { t } = useLocale();
  const [current, setCurrent] = useState('');
  const [verified, setVerified] = useState(false);
  const [next, setNext] = useState('');
  const [showNext, setShowNext] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [changed, setChanged] = useState(false);
  const nextRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (verified) nextRef.current?.focus();
  }, [verified]);

  const reset = () => {
    setCurrent('');
    setNext('');
    setShowNext(false);
    setVerified(false);
    setError('');
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) {
      setError(t('profile.enter_current', 'Enter your current password.'));
      return;
    }
    setBusy(true);
    setError('');
    setChanged(false);
    try {
      await post('/api/auth/verify-password', { currentPassword: current });
      setVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '');
    } finally {
      setBusy(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.trim().length < MIN_LENGTH) {
      setError(t('profile.password_short', 'Your new password needs at least 6 characters.'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await post('/api/auth/change-password', { currentPassword: current, newPassword: next });
      reset();
      setChanged(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={card}>
      <CardHeading>{t('profile.change_password', 'Change password')}</CardHeading>

      <form onSubmit={verified ? save : verify} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          id="current-password"
          label={t('profile.current_password', 'Current password')}
          type="password"
          autoComplete="current-password"
          value={current}
          disabled={verified}
          onChange={(e) => setCurrent(e.target.value)}
          hint={verified ? t('profile.password_verified', 'Verified.') : undefined}
        />
        <div>
          <Field
            ref={nextRef}
            id="new-password"
            label={t('profile.new_password', 'New password')}
            type={showNext ? 'text' : 'password'}
            autoComplete="new-password"
            value={next}
            disabled={!verified}
            onChange={(e) => setNext(e.target.value)}
            hint={verified ? t('profile.password_hint', 'At least 6 characters.') : t('profile.verify_first', 'Verify your current password first.')}
          />
          {verified && (
            <button type="button" aria-pressed={showNext} onClick={() => setShowNext((value) => !value)} className={`${textButton} mt-1`}>
              <span className={textLabel}>{showNext ? t('profile.hide', 'Hide password') : t('profile.show', 'Show password')}</span>
            </button>
          )}
        </div>

        {error && <div className="sm:col-span-2"><FormError>{error}</FormError></div>}
        {changed && <div className="sm:col-span-2"><FormSuccess>{t('profile.password_changed', 'Your password has been changed.')}</FormSuccess></div>}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:col-span-2">
          <button type="submit" disabled={busy} className={primaryButton}>
            <span className={primaryLabel}>
              {busy
                ? t('profile.checking', 'Checking…')
                : verified
                ? t('profile.update_password', 'Update password')
                : t('profile.verify', 'Verify')}
            </span>
          </button>
          {verified ? (
            <button type="button" disabled={busy} onClick={reset} className={secondaryButton}>
              <span className={secondaryLabel}>{t('profile.cancel', 'Cancel')}</span>
            </button>
          ) : (
            <Link href="/forgot-password" className={`${textButton} ml-1`}>
              <span className={textLabel}>{t('profile.forgot', 'Forgot your password?')}</span>
            </Link>
          )}
        </div>
      </form>
    </section>
  );
}
