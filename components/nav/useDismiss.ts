'use client';

import { useEffect, type RefObject } from 'react';

/** Closes a menu on Escape (returning focus to its trigger) or on a press outside it and its trigger. */
export function useDismiss(
  open: boolean,
  close: () => void,
  panelRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      close();
      triggerRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close, panelRef, triggerRef]);
}

/** Shared look for the header: dark text, soft round hover, a visible focus ring. */
export const headerFocus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]';
export const headerIconButton = `relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[#222222] transition-colors hover:bg-[#222222]/[0.07] ${headerFocus}`;
export const headerTextButton = `inline-flex h-11 items-center gap-2 rounded-full px-4 text-[#222222] transition-colors hover:bg-[#222222]/[0.07] ${headerFocus}`;
export const headerBadge =
  'absolute -right-0.5 -top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-etsy-orange px-1 text-[11px] font-bold leading-none text-white tabular-nums';
