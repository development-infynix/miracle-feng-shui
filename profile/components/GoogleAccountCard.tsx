'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import GoogleMark from '@/components/GoogleMark';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { card, CardHeading, focusRing, secondaryButton, secondaryLabel } from './profileUi';

/**
 * Shown instead of Change password for accounts made with Google: they have no password here,
 * so sign-in security lives in the customer's Google account.
 */
export default function GoogleAccountCard({ email }: { email: string }) {
  const { t } = useLocale();
  const { setUserLoggedIn } = useCart();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    setUserLoggedIn(false);
    // This page needs a login, so leave it rather than staying on it signed out.
    await signOut({ callbackUrl: '/' });
  };

  return (
    <section aria-labelledby="google-account" className={card}>
      <CardHeading>
        <span id="google-account">{t('profile.sign_in_security', 'Sign-in and security')}</span>
      </CardHeading>

      <div className="mt-4 flex items-start gap-4 rounded-xl border border-[#E1E3DF] bg-[#F5F5F1] p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E1E3DF] bg-white">
          <GoogleMark className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-[16px] font-semibold text-[#222222]">
            {t('profile.google_managed', 'Your sign-in is handled by your Google account')}
          </p>
          <p className="mt-0.5 break-all text-[14px] font-medium text-[#222222]">{email}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-[#595959]">
            {t(
              'profile.google_no_password',
              "You sign in with Google, so there's no password to change or reset here. To change your password or turn on 2-step verification, go to your Google account."
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href="https://myaccount.google.com/security"
          target="_blank"
          rel="noopener noreferrer"
          className={`${secondaryButton} gap-2`}
        >
          <span className={secondaryLabel}>{t('profile.manage_google', 'Manage your Google account')}</span>
          <i aria-hidden="true" className="fa-solid fa-arrow-up-right-from-square text-[12px] text-[#222222]" />
          <span className="sr-only">{t('profile.opens_new_tab', '(opens in a new tab)')}</span>
        </a>
        <button
          type="button"
          disabled={signingOut}
          onClick={() => void handleSignOut()}
          className={`group inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-[#8F1610]/40 px-3 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
        >
          <span className="text-[15px] font-semibold text-[#8F1610] transition-colors group-hover:text-[#5E0E0A]">
            {t('nav.sign_out', 'Sign out')}
          </span>
        </button>
      </div>
    </section>
  );
}
