'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from './useGlassModal';
import type { NavCategory } from '@/lib/nav-categories';
import type { ProductSummary } from '@/lib/placeholder-data';
import { ProductLink, useProductDrawer } from '@/shop/components/ProductDrawerProvider';
import { translateCategory, translateProductTitle } from '@/lib/translations';

const MAX_RESULTS = 6;
const NEW_ARRIVALS_COUNT = 4;
const SEARCH_DEBOUNCE_MS = 300;
const LISTBOX_ID = 'general-search-results';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
const iconButtonClass =
  'group flex w-9 h-9 shrink-0 items-center justify-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink';
const sectionTitleClass = 'block px-2 pb-2 font-geist text-[13px] font-semibold text-ink';

async function fetchProducts(params: Record<string, string>, signal: AbortSignal) {
  const res = await fetch(`/api/products?${new URLSearchParams(params)}`, { signal });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(`Request failed: ${res.status}`);
  return json.data as { items: ProductSummary[]; total: number };
}

interface SearchResult {
  term: string;
  items: ProductSummary[];
  failed: boolean;
}

interface GeneralSearchModalProps {
  open: boolean;
  onClose: () => void;
  /** The latest categories, loaded on the server by app/layout.tsx. */
  categories: NavCategory[];
}

/** Site search: one sharp stone panel, with the search field on top and results below. */
export default function GeneralSearchModal({ open, onClose, categories }: GeneralSearchModalProps) {
  const router = useRouter();
  const { formatPrice, language, t } = useLocale();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [arrivals, setArrivals] = useState<{ items: ProductSummary[]; failed: boolean } | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const poured = useGlassModal({ open, onClose, panelRef, initialFocusRef: inputRef });

  const term = query.trim();

  // New arrivals: fresh from the server each time the modal opens.
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetchProducts({ sort: 'newest', pageSize: String(NEW_ARRIVALS_COUNT) }, controller.signal)
      .then(({ items }) => setArrivals({ items, failed: false }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('Failed to load new arrivals:', error);
        setArrivals({ items: [], failed: true });
      });
    return () => controller.abort();
  }, [open, retryCount]);

  // Search: on the server, once typing pauses. Aborting means a slow early request
  // can't overwrite the results of a later one.
  useEffect(() => {
    if (!open || !term) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchProducts({ q: term, pageSize: String(MAX_RESULTS) }, controller.signal)
        .then(({ items }) => setResult({ term, items, failed: false }))
        .catch((error) => {
          if (controller.signal.aborted) return;
          console.error('Search failed:', error);
          setResult({ term, items: [], failed: true });
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, term, retryCount]);

  const retry = () => {
    if (term) setResult(null);
    else setArrivals(null);
    setRetryCount((n) => n + 1);
  };

  const searching = Boolean(term) && result?.term !== term;
  // While a new search runs, the previous results stay up (dimmed) so the panel doesn't jump.
  const searchItems = result?.items ?? [];
  const rows = term ? searchItems : (arrivals?.items ?? []);

  const { openProduct } = useProductDrawer();

  const updateQuery = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const active = rows[activeIndex];
    if (active) {
      openProduct(active);
    } else {
      router.push(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
    }
    onClose();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (rows.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % rows.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? rows.length - 1 : i - 1));
    }
  };

  if (!open) return null;

  const categoryChips = (
    <section>
      <h3><span className={sectionTitleClass}>{t('search.browse_categories', 'Browse categories')}</span></h3>
      <div className="flex flex-wrap gap-1.5 px-1">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${encodeURIComponent(category.name)}`}
            onClick={onClose}
            className="group inline-flex h-8 items-center border border-ink/20 bg-white/50 px-2.5 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-ink"
          >
            {/* Text colour sits on this span: the global `a { color: inherit }` rule overrides colour utilities on the link. */}
            <span className="text-[13px] font-medium text-ink transition-colors group-hover:text-logo-purple">
              {translateCategory(category.name, language)}
            </span>
          </Link>
        ))}
        <Link
          href="/shop"
          onClick={onClose}
          className="group inline-flex h-8 items-center border border-ink/20 bg-white/50 px-2.5 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-ink"
        >
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink transition-colors group-hover:text-logo-purple">
            {t('nav.view_all', 'View all')}
            <i aria-hidden="true" className="fa-solid fa-arrow-right text-[10px]" />
          </span>
        </Link>
      </div>
    </section>
  );

  const productRows = (
    <ul id={LISTBOX_ID} role="listbox" aria-label={t('nav.search', 'Search')} className="list-none">
      {rows.map((product, idx) => {
        const active = idx === activeIndex;
        return (
          <li key={product.id} id={`${LISTBOX_ID}-${idx}`} role="option" aria-selected={active}>
            <ProductLink product={product}
              onClick={onClose}
              onMouseEnter={() => setActiveIndex(idx)}
              className="group flex items-center gap-3 p-1.5 hover:bg-white/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
            >
              <img
                src={product.images[0] || FALLBACK_IMAGE}
                alt=""
                className="h-12 w-12 shrink-0 bg-[#E2DDD1] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-[14px] font-medium transition-colors ${active ? 'text-logo-purple' : 'text-ink'}`}>
                  {translateProductTitle(product.name, language, product.id)}
                </span>
                <span className="block truncate text-[12px] text-ink-muted">
                  {translateCategory(product.category, language)}
                </span>
              </span>
              <span className="shrink-0 text-[13.5px] font-semibold tabular-nums text-ink">
                {formatPrice(product.price)}
              </span>
              {/* The wrapper does the hiding: Font Awesome's display rule beats utilities on the icon. */}
              <span aria-hidden="true" className="hidden md:block">
                <i className={`fa-solid fa-arrow-right text-[11px] text-logo-purple transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} />
              </span>
            </ProductLink>
          </li>
        );
      })}
    </ul>
  );

  const loadingRows = (
    <div role="status" aria-label={t('search.loading', 'Loading products')} className="flex flex-col gap-1.5 p-1.5">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-3 motion-safe:animate-pulse">
          <div className="h-12 w-12 shrink-0 bg-ink/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/5 bg-ink/10" />
            <div className="h-2.5 w-1/4 bg-ink/10" />
          </div>
        </div>
      ))}
    </div>
  );

  const loadFailed = (message: string) => (
    <div role="alert" className="flex items-center justify-between gap-3 px-2 py-1">
      <p className="text-[14px] text-ink">{message}</p>
      <button
        type="button"
        onClick={retry}
        className="group shrink-0 cursor-pointer rounded-full px-2 py-1 focus-visible:outline-2 focus-visible:outline-ink"
      >
        <span className="font-geist text-[13px] font-semibold text-ink transition-colors group-hover:text-logo-purple">
          {t('search.try_again', 'Try again')}
        </span>
      </button>
    </div>
  );

  let panelBody: React.ReactNode;
  if (!term) {
    panelBody = (
      <div className="space-y-4">
        {categoryChips}
        <section>
          <h3><span className={sectionTitleClass}>{t('search.new_arrivals', 'New arrivals')}</span></h3>
          {!arrivals
            ? loadingRows
            : arrivals.failed
              ? loadFailed(t('search.arrivals_failed', "Couldn't load new arrivals."))
              : productRows}
        </section>
      </div>
    );
  } else if (searching && searchItems.length === 0) {
    panelBody = loadingRows;
  } else if (!searching && result?.failed) {
    panelBody = loadFailed(t('search.search_failed', "Search isn't working right now."));
  } else if (!searching && searchItems.length === 0) {
    panelBody = (
      <div className="space-y-4">
        <p role="status" className="px-2 pt-1 text-[14px] text-ink">
          {t('search.no_results', 'No products match')} &ldquo;{term}&rdquo;.{' '}
          {t('search.no_results_hint', 'Check the spelling, or browse a category.')}
        </p>
        {categoryChips}
      </div>
    );
  } else {
    panelBody = (
      <div aria-busy={searching} className={`transition-opacity ${searching ? 'opacity-60' : 'opacity-100'}`}>
        {productRows}
        <button
          type="submit"
          form="general-search-form"
          className="group mt-1.5 flex h-11 w-full items-center justify-between gap-3 border-t border-ink/15 px-2 pt-1.5 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-ink"
        >
          <span className="min-w-0 truncate font-geist text-[14px] font-semibold text-ink transition-colors group-hover:text-logo-purple">
            {t('search.see_all', 'See all results for')} &ldquo;{term}&rdquo;
          </span>
          <i aria-hidden="true" className="fa-solid fa-arrow-right text-[12px] text-ink" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#141210]/25 px-3 pt-2.5 backdrop-blur-md animate-in fade-in duration-200 motion-reduce:animate-none md:pt-[12vh]"
      onMouseDown={(e) => {
        if (!panelRef.current?.contains(e.target as Node)) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.search', 'Search')}
        className="mx-auto w-full max-w-[640px] font-geist"
      >
        <div className={`border border-ink/10 glass-veil shadow-[0_18px_40px_rgba(20,18,16,0.18)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${poured ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}>
          <form
            id="general-search-form"
            role="search"
            onSubmit={handleSubmit}
            className="flex h-14 items-center gap-1 border-b border-ink/10 pl-3 pr-2"
          >
            <span aria-hidden="true" className="flex w-8 shrink-0 justify-center">
              <i className="fa-solid fa-magnifying-glass text-[16px] text-ink" />
            </span>
            <div className="relative h-full min-w-0 flex-1">
              <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={rows.length > 0}
              aria-controls={LISTBOX_ID}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? `${LISTBOX_ID}-${activeIndex}` : undefined}
              aria-label={t('nav.search', 'Search')}
              autoComplete="off"
              enterKeyHint="search"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={t('nav.search_placeholder', 'Search items...')}
              style={{ outline: 'none', boxShadow: 'none' }}
              className={`peer h-full w-full bg-transparent pl-1 text-[16px] font-medium text-ink placeholder:text-ink-muted [text-overflow:ellipsis] ${query ? 'caret-ink' : 'caret-transparent'}`}
            />
              {/* The native caret is too faint on the glass, so an empty field shows a stronger one. */}
              {!query && (
                <span
                  aria-hidden="true"
                  className="search-caret pointer-events-none absolute left-0 top-1/2 hidden h-5 w-0.5 -translate-y-1/2 rounded-full bg-ink peer-focus:block"
                />
              )}
            </div>
            {query && (
              <button
                type="button"
                aria-label={t('search.clear', 'Clear search')}
                onClick={() => {
                  updateQuery('');
                  inputRef.current?.focus();
                }}
                className="group shrink-0 cursor-pointer rounded-full px-2 py-1 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <span className="font-geist text-[13px] font-medium text-ink transition-colors group-hover:text-logo-purple">
                  {t('search.clear_short', 'Clear')}
                </span>
              </button>
            )}
            <button
              type="button"
              aria-label={t('search.close', 'Close search')}
              onClick={onClose}
              className={iconButtonClass}
            >
              <i aria-hidden="true" className="fa-solid fa-xmark text-[17px] text-ink transition-colors group-hover:text-logo-purple" />
            </button>
          </form>
            <div className="max-h-[calc(100dvh-124px)] overflow-y-auto no-scrollbar p-3 md:max-h-[58vh]">
              {panelBody}
            </div>
        </div>
      </div>
    </div>
  );
}
