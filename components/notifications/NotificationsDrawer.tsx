'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from '@/home/components/useGlassModal';
import { useProductDrawer } from '@/shop/components/ProductDrawerProvider';
import type { NotificationItem, NotificationKind } from './useNotifications';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#222222]';
const skeleton = 'animate-pulse rounded-sm bg-[#222222]/10 motion-reduce:animate-none';
// Two clearly separate pills, each a full 44px tap target on phones.
const pill = `group inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-[#222222] px-4 transition-colors hover:bg-[#222222]/[0.06] disabled:cursor-not-allowed disabled:border-[#222222]/30 disabled:hover:bg-transparent ${focusRing}`;

const KIND_ICON: Record<NotificationKind, string> = {
  ORDER: 'fa-box',
  REFUND: 'fa-indian-rupee-sign',
  REVIEW: 'fa-star',
};

const PRODUCT_LINK = /^\/shop\?product=([^&]+)$/;

type LoadStatus = 'loading' | 'ready' | 'failed';

function timeAgo(iso: string, language: string) {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  let rtf: Intl.RelativeTimeFormat;
  try {
    rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  } catch {
    rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  }
  if (Math.abs(seconds) >= 7 * 86400) {
    return new Date(iso).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(0, 'minute');
}

const HISTORY_KEY = 'notificationsDrawer';
const isOurEntry = () => Boolean((window.history.state as Record<string, unknown> | null)?.[HISTORY_KEY]);

/**
 * While open, the drawer has its own history entry, so the browser's or phone's Back closes it
 * instead of leaving the page. Returns the way to close it from inside (close button, Esc, overlay,
 * or a tapped notification); `then` runs once the entry is gone, so a navigation lands after it.
 */
function useCloseOnBack(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  const thenRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    // Keeps Next's own state in the entry, so the router still recognises it.
    if (!isOurEntry()) window.history.pushState({ ...(window.history.state ?? {}), [HISTORY_KEY]: true }, '');
    const onPop = () => {
      if (isOurEntry()) return;
      onCloseRef.current();
      const then = thenRef.current;
      thenRef.current = null;
      then?.();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [open]);

  return useCallback((then?: () => void) => {
    if (isOurEntry()) {
      thenRef.current = then ?? null;
      window.history.back();
    } else {
      onCloseRef.current();
      then?.();
    }
  }, []);
}

function Row({ item, onOpen }: { item: NotificationItem; onOpen: (item: NotificationItem, e: React.MouseEvent) => void }) {
  const { language } = useLocale();
  const content = (
    <span className="flex w-full items-start gap-3 text-left">
      <span aria-hidden="true" className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F5F1]">
        <i className={`fa-solid ${KIND_ICON[item.kind] ?? 'fa-bell'} text-[15px] text-[#222222]`} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] leading-snug text-[#222222] ${item.read ? 'font-medium' : 'font-semibold'}`}>{item.title}</span>
        <span className="mt-0.5 block text-[14px] leading-relaxed text-[#222222]">{item.body}</span>
        <span className="mt-1 block text-[12px] text-[#595959]">{timeAgo(item.createdAt, language)}</span>
      </span>
      {!item.read && <span aria-hidden="true" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-etsy-orange" />}
    </span>
  );
  const rowClass = `block w-full px-6 py-4 transition-colors hover:bg-[#F5F5F1]/70 ${item.read ? '' : 'bg-[#F5F5F1]/40'} ${focusRing}`;
  const label = item.read ? undefined : `${item.title} (unread)`;
  // A real link, so opening it in a new tab still works.
  if (item.link) {
    return (
      <Link href={item.link} prefetch={false} onClick={(e) => onOpen(item, e)} className={rowClass} aria-label={label}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={(e) => onOpen(item, e)} className={`${rowClass} cursor-pointer`} aria-label={label}>
      {content}
    </button>
  );
}

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Keeps the header badge in step with what happens in here. */
  onUnreadChange: (unread: number) => void;
}

/** The customer's notifications in a drawer from the right, like the product drawer. */
export default function NotificationsDrawer({ open, onClose, onUnreadChange }: NotificationsDrawerProps) {
  const { t } = useLocale();
  const router = useRouter();
  const { openProduct } = useProductDrawer();
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const requestClose = useCloseOnBack(open, onClose);
  const closeDrawer = useCallback(() => requestClose(), [requestClose]);
  // Esc, the overlay and the close button all go through history, so Back stays in step.
  const slidIn = useGlassModal({ open, onClose: closeDrawer, panelRef, initialFocusRef: panelRef });

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [busy, setBusy] = useState<'read' | 'clear' | null>(null);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error();
      setItems(json.data.items);
      onUnreadChange(json.data.unread);
      setStatus('ready');
    } catch {
      setStatus('failed');
    }
  }, [onUnreadChange]);

  // Fresh every time it opens.
  useEffect(() => {
    if (!open) return;
    setActionError('');
    void load();
  }, [open, load]);

  const unread = items.filter((item) => !item.read).length;

  const openItem = (item: NotificationItem, e: React.MouseEvent) => {
    if (!item.read) {
      setItems((list) => list.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      onUnreadChange(Math.max(0, unread - 1));
      void fetch('/api/notifications/read', { method: 'POST', body: JSON.stringify({ id: item.id }) }).catch(() => {});
    }
    const link = item.link;
    // A new tab (Ctrl/Cmd/Shift or middle click) leaves this drawer as it is.
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    // Closes this drawer first, then opens the product's or the order's own drawer.
    const productId = link.match(PRODUCT_LINK)?.[1];
    requestClose(() => (productId ? openProduct(decodeURIComponent(productId)) : router.push(link)));
  };

  const markAllRead = async () => {
    setBusy('read');
    setActionError('');
    try {
      const res = await fetch('/api/notifications/read', { method: 'POST' });
      if (!res.ok) throw new Error();
      setItems((list) => list.map((n) => ({ ...n, read: true })));
      onUnreadChange(0);
    } catch {
      setActionError(t('notifications.action_failed', "That didn't work. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  const clearAll = async () => {
    setBusy('clear');
    setActionError('');
    try {
      const res = await fetch('/api/notifications', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setItems([]);
      onUnreadChange(0);
    } catch {
      setActionError(t('notifications.action_failed', "That didn't work. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div inert={!open} className={`fixed inset-0 z-[9998] transition-[visibility] duration-300 ${open ? 'visible' : 'invisible'}`}>
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${slidIn ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        style={{ outline: 'none' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col overflow-hidden border border-[#E1E3DF] bg-white transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${slidIn ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="shrink-0 border-b border-[#E1E3DF]">
          <div className="flex h-16 items-center justify-between gap-3 pl-6 pr-3">
            <h2 id={titleId} className="min-w-0">
              <span className="block truncate font-serif text-[24px] font-bold text-[#222222]">
                {t('notifications.title', 'Notifications')}
                {unread > 0 && <span className="sr-only">{` (${unread} unread)`}</span>}
              </span>
            </h2>
            <button
              type="button"
              aria-label={t('auth.close', 'Close')}
              onClick={closeDrawer}
              className={`group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full ${focusRing}`}
            >
              <i aria-hidden="true" className="fa-solid fa-xmark text-[18px] text-[#222222]" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
            <button type="button" onClick={() => void markAllRead()} disabled={status !== 'ready' || unread === 0 || busy !== null} className={pill}>
              <i aria-hidden="true" className="fa-solid fa-check-double text-[13px] text-[#222222] group-disabled:text-[#222222]/40" />
              <span className="text-[14px] font-semibold text-[#222222] group-disabled:text-[#222222]/40">
                {busy === 'read' ? t('notifications.marking', 'Marking…') : t('notifications.mark_read', 'Mark all read')}
              </span>
            </button>
            <button type="button" onClick={() => void clearAll()} disabled={status !== 'ready' || items.length === 0 || busy !== null} className={pill}>
              <i aria-hidden="true" className="fa-regular fa-trash-can text-[13px] text-[#222222] group-disabled:text-[#222222]/40" />
              <span className="text-[14px] font-semibold text-[#222222] group-disabled:text-[#222222]/40">
                {busy === 'clear' ? t('notifications.clearing', 'Clearing…') : t('notifications.clear_all', 'Clear all')}
              </span>
            </button>
          </div>
          {actionError && (
            <p role="alert" className="px-6 pb-3 text-[14px] text-[#B42318]">
              {actionError}
            </p>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
          {status === 'loading' && items.length === 0 ? (
            <div aria-hidden="true" className="space-y-6 px-6 py-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className={`${skeleton} h-10 w-10 rounded-full`} />
                  <div className="flex-1 space-y-2">
                    <div className={`${skeleton} h-3 w-2/3`} />
                    <div className={`${skeleton} h-3 w-full`} />
                  </div>
                </div>
              ))}
            </div>
          ) : status === 'failed' ? (
            <div className="mx-auto max-w-[38ch] px-6 py-16 text-center">
              <p role="alert" className="text-[15px] leading-relaxed text-[#222222]">
                {t('notifications.load_error', "We couldn't load your notifications. Check your connection and try again.")}
              </p>
              <button type="button" onClick={() => void load()} className={`${pill} mt-4`}>
                <span className="text-[14px] font-semibold text-[#222222]">{t('common.try_again', 'Try again')}</span>
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="mx-auto max-w-[38ch] px-6 py-16 text-center">
              <i aria-hidden="true" className="fa-regular fa-bell text-[28px] text-[#595959]" />
              <p className="mt-3 text-[17px] font-semibold text-[#222222]">{t('notifications.empty_title', "You're all caught up")}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-[#595959]">
                {t('notifications.empty_hint', "We'll let you know here about your orders, refunds and reviews.")}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E1E3DF]">
              {items.map((item) => (
                <li key={item.id}>
                  <Row item={item} onOpen={openItem} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
