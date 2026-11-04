'use client';

import { useEffect, useRef, useState } from 'react';

interface GlassModalOptions {
  open: boolean;
  onClose: () => void;
  /** The dialog element that Tab stays inside. */
  panelRef: React.RefObject<HTMLElement | null>;
  /** Where the cursor goes when the modal opens. */
  initialFocusRef: React.RefObject<HTMLElement | null>;
}

/**
 * Shared behaviour for modals built on the goo shell: locks page scroll, closes on
 * Escape, keeps Tab inside, and returns focus on close.
 *
 * Returns `poured`, which turns true a moment after opening, so the panel has something
 * to pour out from. Pass it to GooNavShell as `open`.
 */
export function useGlassModal({ open, onClose, panelRef, initialFocusRef }: GlassModalOptions) {
  const [poured, setPoured] = useState(false);

  // Callers usually pass an inline function: a ref stops that from re-running the effect below.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const pourTimer = setTimeout(() => setPoured(true), 40);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), a[href]'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(pourTimer);
      setPoured(false);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [open, panelRef, initialFocusRef]);

  // Once poured, the panel is visible and its fields can take focus.
  useEffect(() => {
    if (poured) initialFocusRef.current?.focus();
  }, [poured, initialFocusRef]);

  return poured;
}
