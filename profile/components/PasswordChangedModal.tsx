'use client';

import React, { useRef, useState } from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from '@/home/components/useGlassModal';
import { focusRing, FormError, primaryButton, primaryLabel } from './profileUi';

export type DevicesChoice = 'sign-out' | 'keep';

/**
 * Confirms the new password, then lets the customer decide what happens on their other devices.
 * Signing them out is the default, since a password is usually changed because it may be known.
 */
export default function PasswordChangedModal({ onDone }: { onDone: (choice: DevicesChoice) => void }) {
  const { t } = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstOptionRef = useRef<HTMLInputElement>(null);
  const [choice, setChoice] = useState<DevicesChoice>('sign-out');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Closing without saving keeps the other devices signed in, the same as choosing it.
  const poured = useGlassModal({ open: true, onClose: () => !saving && onDone('keep'), panelRef, initialFocusRef: firstOptionRef });
  const title = t('profile.password_changed_title', 'Password changed');

  const save = async () => {
    if (choice === 'keep') {
      onDone('keep');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/auth/sign-out-other-devices', { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error();
      onDone('sign-out');
    } catch {
      setError(t('profile.sign_out_others_failed', "Couldn't sign out your other devices. Please try again."));
      setSaving(false);
    }
  };

  const options: { value: DevicesChoice; label: string; hint: string }[] = [
    {
      value: 'sign-out',
      label: t('profile.sign_out_others', 'Sign out of all other devices'),
      hint: t('profile.sign_out_others_hint', 'Recommended. Anyone signed in elsewhere has to sign in again with the new password.'),
    },
    {
      value: 'keep',
      label: t('profile.keep_others', 'Keep other devices signed in'),
      hint: t('profile.keep_others_hint', 'Your other phones and computers stay signed in.'),
    },
  ];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-3">
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-[#2B154C]/25 backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none ${poured ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-changed-title"
        className={`glass-veil relative w-full max-w-[440px] rounded-[28px] p-6 shadow-[0_6px_10px_rgba(67,23,105,0.14),inset_0_2px_0_rgba(255,255,255,0.7),inset_0_-3px_5px_rgba(67,23,105,0.16)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${poured ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
      >
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#431769]">
            <i className="fa-solid fa-check text-[16px] text-white" />
          </span>
          <h2 id="password-changed-title" className="font-serif text-[24px] font-bold leading-tight tracking-tight text-[#111111]">
            {title}
          </h2>
        </div>
        <p className="mt-2 font-outfit text-[15px] leading-relaxed text-[#2B1A3F]">
          {t('profile.password_changed_body', 'Your password was updated. Use the new one next time you sign in.')}
        </p>

        <fieldset className="mt-5">
          <legend className="font-outfit text-[14px] font-semibold text-[#111111]">
            {t('profile.other_devices', 'What about your other devices?')}
          </legend>
          <div className="mt-2 space-y-2">
            {options.map((option, index) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${choice === option.value ? 'border-[#431769] bg-white/70' : 'border-[#431769]/20 bg-white/40'}`}
              >
                <input
                  ref={index === 0 ? firstOptionRef : undefined}
                  type="radio"
                  name="other-devices"
                  value={option.value}
                  checked={choice === option.value}
                  disabled={saving}
                  onChange={() => setChoice(option.value)}
                  className={`mt-1 h-4 w-4 shrink-0 accent-[#431769] ${focusRing}`}
                />
                <span>
                  <span className="block font-outfit text-[15px] font-semibold text-[#111111]">{option.label}</span>
                  <span className="mt-0.5 block font-outfit text-[13px] leading-snug text-[#5B4A70]">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && <div className="mt-3"><FormError>{error}</FormError></div>}

        <button type="button" disabled={saving} onClick={() => void save()} className={`${primaryButton} mt-5 w-full`}>
          <span className={primaryLabel}>{saving ? t('profile.saving', 'Saving…') : t('profile.save_choice', 'Save')}</span>
        </button>
      </div>
    </div>
  );
}
