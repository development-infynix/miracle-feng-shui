'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PagedList } from '../../types';

export type SectionState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: T };

const customerUrl = (userId: string, section?: string) => {
  const base = `/api/admin/users/${encodeURIComponent(userId)}`;
  return section ? `${base}/${section}` : base;
};

async function fetchData<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(`Request failed: ${res.status}`);
  return json.data as T;
}

/** Loads data that arrives whole: the profile, at the route root. */
export function useCustomerSection<T>(userId: string) {
  const [state, setState] = useState<SectionState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const url = customerUrl(userId);

  useEffect(() => {
    const controller = new AbortController();

    fetchData<T>(url, controller.signal)
      .then((data) => setState({ status: 'ready', data }))
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

/**
 * Loads a server-paged drawer list: the first batch on mount, the next on loadMore.
 * The server decides the batch size.
 */
export function useCustomerList<T extends PagedList<{ id: string }>>(
  userId: string,
  section: 'favorites' | 'cart' | 'orders'
) {
  const [state, setState] = useState<SectionState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const moreRequest = useRef<AbortController | null>(null);
  const url = customerUrl(userId, section);

  useEffect(() => {
    const controller = new AbortController();

    fetchData<T>(url, controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('Failed to load customer data:', error);
        setState({ status: 'error' });
      });

    return () => {
      controller.abort();
      moreRequest.current?.abort();
      moreRequest.current = null;
    };
  }, [url, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const loadMore = useCallback(async () => {
    if (state.status !== 'ready' || !state.data.hasMore || moreRequest.current) return;

    const controller = new AbortController();
    moreRequest.current = controller;
    setLoadingMore(true);
    setLoadMoreFailed(false);

    try {
      const next = await fetchData<T>(`${url}?page=${state.data.page + 1}`, controller.signal);
      setState((current) => {
        if (current.status !== 'ready') return current;
        // A row added while browsing shifts the pages, so a row can arrive twice.
        const seen = new Set(current.data.items.map((item) => item.id));
        const added = next.items.filter((item) => !seen.has(item.id));
        return { status: 'ready', data: { ...next, items: [...current.data.items, ...added] } };
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('Failed to load more customer data:', error);
      setLoadMoreFailed(true);
    }

    moreRequest.current = null;
    setLoadingMore(false);
  }, [state, url]);

  return { state, retry, loadMore, loadingMore, loadMoreFailed };
}
