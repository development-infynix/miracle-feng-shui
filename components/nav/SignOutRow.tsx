'use client';

import React, { useState } from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { indexLabel, indexRow, panelRow, panelRowLabel } from './navUi';

/**
 * The Sign out row of the account and phone menus. Not optimistic: it stays in the menu,
 * says "Signing out…" until the server confirms the session is gone (the page then reloads),
 * and says so if it couldn't sign out, so nobody walks away thinking they're signed out when they aren't.
 */
export default function SignOutRow({
  onSignOut,
  iconClass,
  index = false,
}: {
  /** Resolves true once the server has ended the session, false if it hasn't. */
  onSignOut: () => Promise<boolean>;
  /** The icon's width and size, to line up with the menu's other rows. */
  iconClass: string;
  /** Phone menu: a full serif index row like the rows above it, icon on the right. */
  index?: boolean;
}) {
  const { t } = useLocale();
  const [state, setState] = useState<'idle' | 'pending' | 'failed'>('idle');
  const pending = state === 'pending';

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
        className={`${index ? indexRow : panelRow} disabled:cursor-wait`}
      >
        <i
          aria-hidden="true"
          className={`${pending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-arrow-right-from-bracket'} text-center ${index ? 'order-last text-ink transition-colors group-hover:text-logo-purple' : 'text-ink-muted'} ${iconClass}`}
        />
        <span className={index ? indexLabel : panelRowLabel}>{pending ? t('nav.signing_out', 'Signing out…') : t('nav.sign_out', 'Sign out')}</span>
      </button>
      {state === 'failed' && (
        <p role="alert" className={`${index ? '' : 'px-3'} pb-2 font-geist text-[13px] leading-snug text-[#8F1610]`}>
          {t('nav.sign_out_failed', "We couldn't sign you out. Check your connection and try again.")}
        </p>
      )}
    </>
  );
}
