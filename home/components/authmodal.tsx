'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import GooNavShell from '@/components/GooNavShell';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from './useGlassModal';

const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62]';
const labelClass = 'mb-1.5 block px-1 font-outfit text-[13px] font-semibold text-[#431769]';
const fieldClass =
  'h-12 w-full rounded-md border border-white/70 bg-white/55 px-4 font-outfit text-[16px] font-medium text-[#111111] caret-[#7A2FC0] transition-[border-color,box-shadow] placeholder:font-normal placeholder:text-[#5B4A70] focus:border-[#7A2FC0] focus:shadow-[0_0_0_3px_rgba(122,47,192,0.18)] [&:-webkit-autofill]:[-webkit-text-fill-color:#111111] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#F3ECFB]';
// The site-wide focus outline would box in the field. Its border and ring show focus instead.
const fieldStyle: React.CSSProperties = { outline: 'none' };

export type AuthMode = 'signin' | 'register';

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  /** Called once the customer is signed in. */
  onSignedIn: (customer: { name: string; email: string }) => void;
}

/** Customer sign in and sign up: a glass pill with the form hanging below it on a liquid thread. */
export default function AuthModal({ open, mode, onModeChange, onClose, onSignedIn }: AuthModalProps) {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
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

  const tabs: { mode: AuthMode; label: string }[] = [
    { mode: 'signin', label: t('nav.signin', 'Sign in') },
    { mode: 'register', label: t('auth.create_account', 'Create account') },
  ];

  const passwordHintId = 'auth-password-hint';

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto no-scrollbar bg-[#2B154C]/25 px-3 pt-2.5 pb-6 backdrop-blur-md animate-in fade-in duration-200 motion-reduce:animate-none md:pt-[9vh]"
      onMouseDown={(e) => {
        if (!submitting && !panelRef.current?.contains(e.target as Node)) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={isRegister ? t('auth.create_account', 'Create account') : t('nav.signin', 'Sign in')}
        className="mx-auto w-full max-w-[460px] font-outfit"
      >
        <GooNavShell
          open={poured}
          triggerRef={activeTabRef}
          threadKey={mode}
          dropId="auth-panel"
          fitMain
          dropRadius={28}
          dropClassName="w-full"
          dropWrapperClassName="px-2"
          drop={
            <div className="max-h-[calc(100dvh-112px)] overflow-y-auto no-scrollbar px-5 pb-5 pt-5 md:max-h-[72vh]">
              <h2>
                <span className="block font-serif text-[24px] font-bold leading-tight tracking-tight text-[#111111]">
                  {isRegister
                    ? t('auth.register_title', 'Create your account')
                    : t('auth.signin_title', 'Welcome back')}
                </span>
              </h2>
              <p className="mt-1 text-[14px] text-[#5B4A70]">
                {isRegister
                  ? t('auth.register_subtitle', 'Save your favorites and track your orders.')
                  : t('auth.signin_subtitle', 'Sign in to see your favorites, cart and orders.')}
              </p>

              {error && (
                <p role="alert" className="mt-4 rounded-md border border-[#A61A11]/25 bg-white/55 px-4 py-3 text-[14px] text-[#8F1610]">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
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
                    {!isRegister && (
                      <Link
                        href="/forgot-password"
                        onClick={close}
                        className={`group mb-1.5 rounded-full px-1 ${focusRing}`}
                      >
                        <span className="text-[13px] font-medium text-[#431769] underline underline-offset-2 transition-colors group-hover:text-[#7A2FC0]">
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
                      <span className="font-outfit text-[13px] font-medium text-[#431769] transition-colors group-hover:text-[#7A2FC0]">
                        {showPassword ? t('auth.hide', 'Hide') : t('auth.show', 'Show')}
                      </span>
                    </button>
                  </div>
                  {isRegister && (
                    <p id={passwordHintId} className="mt-1.5 px-1 text-[12px] text-[#5B4A70]">
                      {t('auth.password_hint', 'At least 6 characters.')}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`mt-1 h-12 w-full cursor-pointer rounded-md bg-[#431769] transition-colors hover:bg-[#3A1F62] disabled:cursor-wait disabled:opacity-70 ${focusRing}`}
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

              <p className="mt-4 text-center text-[12px] leading-relaxed text-[#5B4A70]">
                {t('auth.terms_prefix', 'By continuing, you agree to our')}{' '}
                <Link href="/terms" onClick={close}>
                  <span className="underline underline-offset-2">{t('auth.terms', 'Terms of Use')}</span>
                </Link>{' '}
                {t('auth.terms_and', 'and')}{' '}
                <Link href="/privacy-policy" onClick={close}>
                  <span className="underline underline-offset-2">{t('auth.privacy', 'Privacy Policy')}</span>
                </Link>
                .
              </p>
            </div>
          }
        >
          <div className="flex h-14 items-center gap-0.5 pl-2 pr-2">
            <div className="flex items-center gap-0.5">
              {tabs.map((tab) => {
                const selected = tab.mode === mode;
                return (
                  <button
                    key={tab.mode}
                    ref={selected ? activeTabRef : undefined}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => switchMode(tab.mode)}
                    className={`group h-10 cursor-pointer rounded-full px-3 ${focusRing}`}
                  >
                    <span
                      className={`whitespace-nowrap font-outfit text-[14px] font-medium tracking-[0.01em] transition-colors group-hover:text-[#7A2FC0] ${selected ? 'text-[#7A2FC0]' : 'text-[#111111]'}`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              aria-label={t('auth.close', 'Close')}
              onClick={close}
              className={`group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full ${focusRing}`}
            >
              <i aria-hidden="true" className="fa-solid fa-xmark text-[17px] text-[#111111] transition-colors group-hover:text-[#7A2FC0]" />
            </button>
          </div>
        </GooNavShell>
      </div>
    </div>
  );
}
