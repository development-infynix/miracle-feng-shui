'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import {
  card,
  CardHeading,
  Field,
  focusRing,
  FormError,
  FormSuccess,
  primaryButton,
  primaryLabel,
  textButton,
  textLabel,
} from './profileUi';

const MIN_LENGTH = 6;
const iconBox = 'flex h-12 w-12 shrink-0 items-center justify-center rounded-md';

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
  const { setUserLoggedIn } = useCart();
  const [current, setCurrent] = useState('');
  const [verified, setVerified] = useState(false);
  const [next, setNext] = useState('');
  const [showNext, setShowNext] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
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

  const handleSignOut = async () => {
    setSigningOut(true);
    setUserLoggedIn(false);
    // This page needs a login, so leave it rather than staying on it signed out.
    await signOut({ callbackUrl: '/' });
  };

  const verifyLabel = busy ? t('profile.checking', 'Checking…') : t('profile.verify', 'Verify');
  const showLabel = showNext ? t('profile.hide', 'Hide password') : t('profile.show', 'Show password');

  return (
    <section className={card}>
      <CardHeading>{t('profile.change_password', 'Change password')}</CardHeading>

      <form onSubmit={verified ? save : verify} noValidate className="mt-4 space-y-4">
        <div>
          <Field
            id="current-password"
            label={t('profile.current_password', 'Current password')}
            type="password"
            autoComplete="current-password"
            value={current}
            disabled={verified}
            onChange={(e) => setCurrent(e.target.value)}
            action={
              verified ? (
                <span aria-hidden="true" className={`${iconBox} border border-[#431769]/25`}>
                  <i className="fa-solid fa-check text-[15px] text-[#7A2FC0]" />
                </span>
              ) : (
                <button
                  type="submit"
                  disabled={busy}
                  aria-label={verifyLabel}
                  title={verifyLabel}
                  className={`${iconBox} cursor-pointer bg-[#431769] transition-colors hover:bg-[#3A1F62] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                >
                  <i aria-hidden="true" className={`fa-solid ${busy ? 'fa-spinner animate-spin' : 'fa-check'} text-[15px] text-white`} />
                </button>
              )
            }
          />
          <div className="mt-1.5 flex min-h-6 items-center justify-between gap-3">
            {verified ? (
              <>
                <FormSuccess>{t('profile.password_verified', 'Verified.')}</FormSuccess>
                <button type="button" disabled={busy} onClick={reset} className={textButton}>
                  <span className={textLabel}>{t('profile.cancel', 'Cancel')}</span>
                </button>
              </>
            ) : (
              <Link href="/forgot-password" className={textButton}>
                <span className={textLabel}>{t('profile.forgot', 'Forgot your password?')}</span>
              </Link>
            )}
          </div>
        </div>

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
          inside={
            verified && (
              <button
                type="button"
                aria-pressed={showNext}
                aria-label={showLabel}
                title={showLabel}
                onClick={() => setShowNext((value) => !value)}
                className={`group flex h-10 w-10 cursor-pointer items-center justify-center rounded-md ${focusRing}`}
              >
                <i aria-hidden="true" className={`fa-regular ${showNext ? 'fa-eye-slash' : 'fa-eye'} text-[15px] text-[#431769] transition-colors group-hover:text-[#7A2FC0]`} />
              </button>
            )
          }
        />

        {error && <FormError>{error}</FormError>}
        {changed && <FormSuccess>{t('profile.password_changed', 'Your password has been changed.')}</FormSuccess>}

        <div className="grid grid-cols-2 gap-3">
          <button type="submit" disabled={!verified || busy} className={`${primaryButton} !px-3`}>
            <span className={primaryLabel}>
              {verified && busy ? t('profile.saving', 'Saving…') : t('profile.update', 'Update')}
            </span>
          </button>
          <button
            type="button"
            disabled={signingOut}
            onClick={() => void handleSignOut()}
            className={`group inline-flex h-12 cursor-pointer items-center justify-center rounded-md border border-[#8F1610]/40 px-3 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            <span className="font-outfit text-[15px] font-semibold text-[#8F1610] transition-colors group-hover:text-[#5E0E0A]">
              {t('nav.sign_out', 'Sign out')}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}
