'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import type { ProductSummary } from '@/lib/placeholder-data';
import ShopProductCard from '@/shop/components/ShopProductCard';
import { card, primaryButton, primaryLabel, secondaryButton, secondaryLabel, skeleton, textButton, textLabel } from './profileUi';

const PAGE_SIZE = 15;

export default function ProfileFavorites() {
  const { isFavorite } = useCart();
  const { t } = useLocale();
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const request = useRef<AbortController | null>(null);

  // A heart loads after its card, so a card only leaves once it has been a favorite and then stopped being one.
  const [seenFavorite, setSeenFavorite] = useState<string[]>([]);
  const newlySeen = items.filter((item) => isFavorite(item.id) && !seenFavorite.includes(item.id));
  if (newlySeen.length > 0) setSeenFavorite([...seenFavorite, ...newlySeen.map((item) => item.id)]);

  const visible = items.filter((item) => !seenFavorite.includes(item.id) || isFavorite(item.id));
  const removedCount = items.length - visible.length;
  const remaining = total - removedCount;

  const load = async (skip: number) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/favorites?skip=${skip}&take=${PAGE_SIZE}`, { signal: controller.signal });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(`Request failed: ${res.status}`);
      setItems((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...current, ...(json.data.items as ProductSummary[]).filter((item) => !known.has(item.id))];
      });
      setTotal(json.data.total);
      setLoading(false);
    } catch {
      if (controller.signal.aborted) return;
      setFailed(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    request.current = controller;
    fetch(`/api/favorites?skip=0&take=${PAGE_SIZE}`, { signal: controller.signal })
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok || !json.success) throw new Error('Failed to load favorites');
        setItems(json.data.items);
        setTotal(json.data.total);
        setLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setFailed(true);
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (loading && items.length === 0) {
    return (
      <div aria-busy="true" className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
        {[0, 1, 2].map((n) => (
          <div key={n} className="rounded-lg bg-white p-2.5 shadow-[0_6px_10px_rgba(67,23,105,0.14)]">
            <div className={`${skeleton} aspect-[4/3] w-full rounded-md`} />
            <div className={`${skeleton} mt-3 h-4 w-3/4`} />
            <div className={`${skeleton} mt-2 h-4 w-1/3`} />
          </div>
        ))}
      </div>
    );
  }

  if (failed && items.length === 0) {
    return (
      <div className={`${card} text-center`}>
        <p role="alert" className="font-outfit text-[15px] text-[#2B1A3F]">
          {t('profile.favorites_failed', "Couldn't load your favorites.")}{' '}
          <button type="button" onClick={() => void load(0)} className={textButton}>
            <span className={textLabel}>{t('profile.try_again', 'Try again')}</span>
          </button>
        </p>
      </div>
    );
  }

  if (remaining <= 0) {
    return (
      <div className={`${card} py-12 text-center`}>
        <h2>
          <span className="block font-serif text-[24px] font-bold tracking-tight text-[#111111]">
            {t('profile.no_favorites', 'No favorites yet')}
          </span>
        </h2>
        <p className="mx-auto mt-2 max-w-[42ch] font-outfit text-[15px] leading-relaxed text-[#5B4A70]">
          {t('profile.no_favorites_hint', 'Tap the heart on any product to save it here.')}
        </p>
        <Link href="/shop" className={`${primaryButton} mt-5`}>
          <span className={primaryLabel}>{t('product.browse', 'Browse products')}</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
        {visible.map((product) => (
          <ShopProductCard key={product.id} product={product} />
        ))}
      </div>

      {visible.length < remaining && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="font-outfit text-[13px] tabular-nums text-[#5B4A70]">
            {t('shop.showing', 'Showing {shown} of {total}').replace('{shown}', String(visible.length)).replace('{total}', String(remaining))}
          </p>
          {failed && (
            <p role="alert" className="font-outfit text-[14px] text-[#8F1610]">
              {t('profile.more_failed', "Couldn't load more. Please try again.")}
            </p>
          )}
          {/* Asks by what's still saved, so removing a favorite doesn't skip the next one. */}
          <button type="button" disabled={loading} onClick={() => void load(visible.length)} className={secondaryButton}>
            <span className={secondaryLabel}>{loading ? t('shop.loading_more', 'Loading…') : t('shop.load_more', 'Load more')}</span>
          </button>
        </div>
      )}
    </>
  );
}
