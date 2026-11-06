'use client';

import React, { useState } from 'react';
import { useLocale } from '@/context/CurrencyContext';

/**
 * The Sign out row of the account and phone menus. Not optimistic: it stays in the menu,
 * says "Signing out…" until the server confirms the session is gone (the page then reloads),
 * and says so if it couldn't sign out, so nobody walks away thinking they're signed out when they aren't.
 */
export default function SignOutRow({
  onSignOut,
  rowClass,
  withIcon = false,
}: {
  /** Resolves true once the server has ended the session, false if it hasn't. */
  onSignOut: () => Promise<boolean>;
  /** The menu's own row style. */
  rowClass: string;
  /** The account menu's rows lead with an icon; the phone menu's don't. */
  withIcon?: boolean;
}) {
  const { t } = useLocale();
  const [state, setState] = useState<'idle' | 'pending' | 'failed'>('idle');
  const pending = state === 'pending';
  const label = pending ? t('nav.signing_out', 'Signing out…') : t('nav.sign_out', 'Sign out');

  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        onClick={async () => {
          setState('pending');
          // On success the page reloads, so the row stays "Signing out…" until it does.
          if (!(await onSignOut())) setState('failed');
        }}
        className={`${rowClass} disabled:cursor-wait disabled:text-[#595959]`}
      >
        {withIcon ? (
          <>
            <i
              aria-hidden="true"
              className={`${pending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-arrow-right-from-bracket'} w-4 text-center text-[#595959]`}
            />
            {label}
          </>
        ) : (
          <>
            {label}
            {pending && <i aria-hidden="true" className="fa-solid fa-spinner fa-spin text-[14px] text-[#595959]" />}
          </>
        )}
      </button>
      {state === 'failed' && (
        <p role="alert" className="px-3 pb-2 text-[13px] leading-snug text-[#B91C1C]">
          {t('nav.sign_out_failed', "We couldn't sign you out. Check your connection and try again.")}
        </p>
      )}
    </>
  );
}
