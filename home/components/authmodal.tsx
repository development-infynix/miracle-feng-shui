'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getProviders, signIn } from 'next-auth/react';
import { useLocale } from '@/context/CurrencyContext';
import GoogleMark from '@/components/GoogleMark';
import { useGlassModal } from './useGlassModal';

const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#222222]';
const labelClass = 'mb-1 block px-1 font-outfit text-[13px] font-semibold text-[#222222]';
const fieldClass =
  'h-11 w-full rounded-lg border border-[#E1E3DF] bg-white/55 px-4 font-outfit text-[16px] font-medium text-[#222222] caret-[#222222] transition-[border-color,box-shadow] placeholder:font-normal placeholder:text-[#595959] focus:border-[#222222] focus:shadow-[0_0_0_3px_rgba(34,34,34,0.12)] [&:-webkit-autofill]:[-webkit-text-fill-color:#222222] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#F5F5F1]';
// The site-wide focus outline would box in the field. Its border and ring show focus instead.
const fieldStyle: React.CSSProperties = { outline: 'none' };

export type AuthMode = 'signin' | 'register';

// Asked once per page load: the Google button shows only when the server has Google sign-in set up.
let googleAvailable: Promise<boolean> | null = null;
const checkGoogle = () =>
  (googleAvailable ??= getProviders()
    .then((providers) => Boolean(providers?.google))
    .catch(() => false));


interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  /** A message to show when the modal opens, such as why a Google sign-in didn't go through. */
  initialError?: string;
  /** Called once the customer is signed in. */
  onSignedIn: (customer: { name: string; email: string }) => void;
}

/** Customer sign in and sign up: a glass pill with the form hanging below it on a liquid thread. */
export default function AuthModal({ open, mode, onModeChange, onClose, initialError, onSignedIn }: AuthModalProps) {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [google, setGoogle] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let live = true;
    checkGoogle().then((available) => live && setGoogle(available));
    return () => {
      live = false;
    };
  }, [open]);

  useEffect(() => {
    if (open && initialError) setError(initialError);
  }, [open, initialError]);

  /** Leaves for Google, and comes back to this page signed in. A new customer gets an account on the way. */
  const continueWithGoogle = async () => {
    setError('');
    setGoogleBusy(true);
    try {
      await signIn('google', { callbackUrl: window.location.href });
    } catch {
      setGoogleBusy(false);
      setError(t('auth.google_failed', "We couldn't sign you in with Google. Please try again."));
    }
  };

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const isRegister = mode === 'register';

  const close = () => {
    setPassword('');
    setShowPassword(false);
    setError('');
    onClose();
  };

  const poured = useGlassModal({ open, onClose: close, panelRef, initialFocusRef: firstFieldRef });

  const switchMode = (next: AuthMode) => {
    setError('');
    onModeChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    try {
      if (isRegister) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cleanName, email: cleanEmail, password: cleanPassword }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.details?.[0]?.message || data.error || t('auth.register_failed', "We couldn't create your account. Please try again."));
          return;
        }
      }

      const result = await signIn('credentials', {
        email: cleanEmail,
        password: cleanPassword,
        redirect: false,
      });

      if (result?.error) {
        setError(t('auth.invalid_credentials', "That email and password don't match. Try again, or reset your password."));
        return;
      }

      setPassword('');
      setShowPassword(false);
      onSignedIn({ name: cleanName || cleanEmail.split('@')[0], email: cleanEmail });
    } catch {
      setError(t('auth.unexpected', 'Something went wrong. Check your connection and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const passwordHintId = 'auth-password-hint';

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto no-scrollbar bg-black/40 px-3 pt-2.5 pb-4 animate-in fade-in duration-200 motion-reduce:animate-none md:pt-[6vh]"
      onMouseDown={(e) => {
        if (submitting && panelRef.current && !panelRef.current.contains(e.target as Node)) close();
        if (!submitting && !panelRef.current?.contains(e.target as Node)) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={isRegister ? t('auth.create_account', 'Create account') : t('nav.signin', 'Sign in')}
        className="relative mx-auto w-full max-w-[460px] rounded-[28px] border border-[#E1E3DF] bg-white px-1 font-outfit shadow-[0_18px_60px_rgba(34,34,34,0.18)] transition-opacity duration-200 motion-reduce:transition-none"
        style={{ opacity: poured ? 1 : 0 }}
      >
        <div className="max-h-[calc(100dvh-80px)] overflow-y-auto no-scrollbar px-5 pb-4 pt-5 md:max-h-[85vh]">
              <button
                type="button"
                aria-label={t('auth.close', 'Close')}
                onClick={close}
                className={`group absolute right-3 top-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ${focusRing}`}
              >
                <i aria-hidden="true" className="fa-solid fa-xmark text-[17px] text-[#222222]" />
              </button>
              <h2 className="pr-10">
                <span className="block font-serif text-[22px] font-bold leading-tight tracking-tight text-[#222222]">
                  {isRegister
                    ? t('auth.register_title', 'Create your account')
                    : t('auth.signin_title', 'Welcome back')}
                </span>
              </h2>
              <p className="mt-0.5 text-[14px] text-[#595959]">
                {isRegister
                  ? t('auth.register_subtitle', 'Save your favorites and track your orders.')
                  : t('auth.signin_subtitle', 'Sign in to see your favorites, cart and orders.')}
              </p>

              {error && (
                <p role="alert" className="mt-3 rounded-md border border-[#A61A11]/25 bg-white/55 px-4 py-3 text-[14px] text-[#8F1610]">
                  {error}
                </p>
              )}

              {google && (
                <>
                  <button
                    type="button"
                    onClick={() => void continueWithGoogle()}
                    disabled={googleBusy || submitting}
                    className={`mt-3 flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-[#E1E3DF] bg-white transition-colors hover:border-[#222222] disabled:cursor-wait disabled:opacity-70 ${focusRing}`}
                  >
                    <GoogleMark />
                    <span className="font-outfit text-[15px] font-semibold text-[#222222]">
                      {googleBusy ? t('auth.google_redirecting', 'Opening Google…') : t('auth.continue_google', 'Continue with Google')}
                    </span>
                  </button>
                  <div className="mt-3 flex items-center gap-3" aria-hidden="true">
                    <span className="h-px flex-1 bg-[#E1E3DF]" />
                    <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#595959]">{t('auth.or', 'or')}</span>
                    <span className="h-px flex-1 bg-[#E1E3DF]" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
                {isRegister && (
                  <div>
                    <label htmlFor="auth-name" className={labelClass}>
                      {t('auth.name', 'Name')}
                    </label>
                    <input
                      id="auth-name"
                      ref={firstFieldRef}
                      type="text"
                      required
                      minLength={MIN_NAME_LENGTH}
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={fieldStyle}
                      className={fieldClass}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email" className={labelClass}>
                    {t('auth.email', 'Email address')}
                  </label>
                  <input
                    id="auth-email"
                    ref={isRegister ? undefined : firstFieldRef}
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={fieldStyle}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor="auth-password" className={labelClass}>
                      {t('auth.password', 'Password')}
                    </label>
                    {isRegister ? (
                      <p id={passwordHintId} className="mb-1 px-1 text-[12px] text-[#595959]">
                        {t('auth.password_hint', 'At least 6 characters.')}
                      </p>
                    ) : (
                      <Link
                        href="/forgot-password"
                        onClick={close}
                        className={`group mb-1 rounded-full px-1 ${focusRing}`}
                      >
                        <span className="text-[13px] font-medium text-[#222222] underline underline-offset-2 transition-colors group-hover:text-[#222222]">
                          {t('auth.forgot', 'Forgot password?')}
                        </span>
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={isRegister ? MIN_PASSWORD_LENGTH : undefined}
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                      aria-describedby={isRegister ? passwordHintId : undefined}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={fieldStyle}
                      className={`${fieldClass} pr-16`}
                    />
                    <button
                      type="button"
                      aria-pressed={showPassword}
                      aria-label={showPassword ? t('auth.hide_password', 'Hide password') : t('auth.show_password', 'Show password')}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`group absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full px-2 py-1 ${focusRing}`}
                    >
                      <span className="font-outfit text-[13px] font-medium text-[#222222] transition-colors group-hover:text-[#222222]">
                        {showPassword ? t('auth.hide', 'Hide') : t('auth.show', 'Show')}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`mt-1 h-11 w-full cursor-pointer rounded-md bg-[#222222] transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70 ${focusRing}`}
                >
                  <span className="font-outfit text-[15px] font-semibold text-white">
                    {submitting
                      ? isRegister
                        ? t('auth.creating', 'Creating your account…')
                        : t('auth.signing_in', 'Signing in…')
                      : isRegister
                        ? t('auth.create_account', 'Create account')
                        : t('nav.signin', 'Sign in')}
                  </span>
                </button>
              </form>

              <p className="mt-3 text-center text-[14px] text-[#595959]">
                {isRegister ? t('auth.have_account', 'Already have an account?') : t('auth.no_account', "Don't have an account?")}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(isRegister ? 'signin' : 'register')}
                  className={`cursor-pointer rounded-sm ${focusRing}`}
                >
                  <span className="font-semibold text-[#222222] underline underline-offset-2">
                    {isRegister ? t('nav.signin', 'Sign in') : t('auth.sign_up', 'Sign up')}
                  </span>
                </button>
              </p>
            </div>
      </div>
    </div>
  );
}

