'use client';

import { useEffect, type RefObject } from 'react';

// Shared styles and behaviour for the site navbar (components/Header.tsx).
// globals.css sets colour on links and fonts on buttons outside Tailwind's layers,
// so text styles go on an inner span.

export const navFocus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141210]';

/** A text item in the bar: Categories, Products, Search, Sign in. Add the display class where it's used. */
export const navItem = `group h-10 items-center gap-1.5 rounded-full px-3 cursor-pointer ${navFocus}`;
export const navLabel = 'font-geist text-[15px] font-medium text-ink transition-colors group-hover:text-logo-purple';
export const navLabelActive = 'font-geist text-[15px] font-medium text-logo-purple';

/** Small purple count on Favorites. */
export const navBadge =
  'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-logo-purple px-1 font-geist text-[11px] font-semibold leading-none text-white tabular-nums';

/** A white panel that drops from the bar (categories, account). */
export const navPanel =
  'border border-ink/10 glass-veil shadow-[0_18px_40px_rgba(20,18,16,0.18)] origin-top transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none';
export const navPanelOpen = 'visible translate-y-0 opacity-100';
export const navPanelClosed = 'invisible -translate-y-1 opacity-0 pointer-events-none';

/** A row inside a panel or the phone menu. */
export const panelRow = `group flex w-full items-center gap-3 rounded-[10px] px-3 h-11 text-left cursor-pointer transition-colors hover:bg-stone ${navFocus}`;
export const panelRowLabel = 'font-geist text-[15px] font-medium text-ink';

/** A line of the phone menu's serif index: the whole row is the hit area, hairline above. */
export const indexRow = `group flex h-14 w-full items-center justify-between gap-4 border-t border-ink/15 first:border-t-0 text-left cursor-pointer ${navFocus}`;
export const indexLabel =
  'font-display text-[24px] font-normal leading-none tracking-[-0.01em] text-ink transition-colors group-hover:text-logo-purple';

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
