'use client';

import { useCallback, useEffect, useState } from 'react';

export type SectionState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: T };

/**
 * Loads one drawer tab's data from /api/admin/users/[id].
 * Pass no section for the profile, which lives at the route root.
 */
export function useCustomerSection<T>(userId: string, section?: 'favorites' | 'cart' | 'orders') {
  const [state, setState] = useState<SectionState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  const base = `/api/admin/users/${encodeURIComponent(userId)}`;
  const url = section ? `${base}/${section}` : base;

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(`Request failed: ${res.status}`);
        setState({ status: 'ready', data: json.data as T });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('Failed to load customer data:', error);
        setState({ status: 'error' });
      });

    return () => controller.abort();
  }, [url, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
