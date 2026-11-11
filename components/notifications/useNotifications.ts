'use client';

import { useCallback, useEffect, useState } from 'react';

export type NotificationKind = 'ORDER' | 'REFUND' | 'REVIEW';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const REFRESH_MS = 60_000;

/**
 * The signed-in customer's unread count for the header. Checks on sign-in, when the tab comes back
 * into view, and every minute while it's visible. Nothing runs for guests.
 */
export function useUnreadNotifications(signedIn: boolean) {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?count=1', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.success) setUnread(json.data.unread);
    } catch {
      // The badge just keeps its last value; the drawer shows its own error.
    }
  }, []);

  useEffect(() => {
    if (!signedIn) {
      setUnread(0);
      return;
    }
    void refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const timer = setInterval(onVisible, REFRESH_MS);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [signedIn, refresh]);

  return { unread, setUnread, refresh };
}
