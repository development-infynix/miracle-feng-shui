'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductSummary } from '@/lib/placeholder-data';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory, translateProductTitle } from '@/lib/translations';
import { useProductDrawer } from '@/shop/components/ProductDrawerProvider';
import { headerFocus, useDismiss } from './useDismiss';

const SEARCH_DELAY_MS = 250;
const RESULT_LIMIT = 6;

type Status = 'idle' | 'loading' | 'done' | 'failed';

/**
 * The header's search bar. Results drop down under it as you type (no modal); Enter or the search
 * button opens the shop with every result. Arrow keys move through the list, Escape closes it.
 */
export default function NavSearch({ className = '' }: { className?: string }) {
  const router = useRouter();
  const { openProduct } = useProductDrawer();
  const { formatPrice, language, t } = useLocale();
  const listId = useId();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [attempt, setAttempt] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);
  useDismiss(open, close, wrapperRef, inputRef);

  const term = query.trim();

  // Searches the server once typing pauses; a newer search cancels the one before it.
  useEffect(() => {
    if (!term) {
      setResults([]);
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus('loading');
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(term)}&pageSize=${RESULT_LIMIT}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error('Search failed');
        setResults(json.data?.items ?? []);
        setStatus('done');
        setActive(-1);
      } catch {
        if (!controller.signal.aborted) setStatus('failed');
      }
    }, SEARCH_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, attempt]);

  const showAll = () => {
    if (!term) return;
    close();
    inputRef.current?.blur();
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  };

  const pick = (product: ProductSummary) => {
    close();
    inputRef.current?.blur();
    openProduct(product);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && results[active]) pick(results[active]);
      else showAll();
    }
  };

  const showPanel = open && term.length > 0;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          showAll();
        }}
        className="flex h-12 items-center rounded-full border-2 border-[#222222] bg-white pl-5 pr-1 transition-shadow focus-within:shadow-[0_0_0_4px_rgba(34,34,34,0.12)]"
      >
        <label htmlFor="header-search" className="sr-only">
          {t('nav.search_label', 'Search for anything')}
        </label>
        <input
          ref={inputRef}
          id="header-search"
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t('nav.search_placeholder', 'Search for anything')}
          style={{ outline: 'none' }}
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-[#222222] placeholder:text-[#595959] [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label={t('nav.clear_search', 'Clear search')}
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className={`mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#222222] hover:bg-[#222222]/[0.07] ${headerFocus}`}
          >
            <i aria-hidden="true" className="fa-solid fa-xmark text-[18px]" />
          </button>
        )}
        <button
          type="submit"
          aria-label={t('nav.search', 'Search')}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2B154C] text-white transition-colors hover:bg-[#431769] ${headerFocus}`}
        >
          <i aria-hidden="true" className="fa-solid fa-magnifying-glass text-[17px]" />
        </button>
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#E1E3DF] bg-white shadow-[0_12px_32px_rgba(34,34,34,0.16)]">
          {status === 'loading' && results.length === 0 && (
            <p className="px-5 py-4 text-[15px] text-[#595959]">{t('nav.searching', 'Searching…')}</p>
          )}
          {status === 'failed' && (
            <p role="alert" className="px-5 py-4 text-[15px] text-[#222222]">
              {t('nav.search_failed', "Search isn't working right now.")}{' '}
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className={`font-semibold underline ${headerFocus}`}>
                {t('nav.try_again', 'Try again')}
              </button>
            </p>
          )}
          {status === 'done' && results.length === 0 && (
            <p className="px-5 py-4 text-[15px] text-[#595959]">
              {t('nav.no_results', 'No results for "{query}"').replace('{query}', term)}
            </p>
          )}

          {results.length > 0 && (
            <ul id={listId} role="listbox" aria-label={t('nav.search_results', 'Search results')} className="max-h-[60vh] list-none overflow-y-auto py-2">
              {results.map((product, index) => (
                <li
                  key={product.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(product)}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${index === active ? 'bg-[#F5F5F1]' : ''}`}
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F0EFEB]">
                    {product.images?.[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] text-[#222222]">
                      {translateProductTitle(product.name, language, product.id)}
                    </span>
                    <span className="block truncate text-[13px] text-[#595959]">{translateCategory(product.category, language)}</span>
                  </span>
                  <span className="shrink-0 text-[15px] font-semibold text-[#222222] tabular-nums">{formatPrice(product.price)}</span>
                </li>
              ))}
            </ul>
          )}

          {term && status !== 'failed' && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={showAll}
              className={`flex w-full items-center justify-between border-t border-[#E1E3DF] px-5 py-3.5 text-left text-[15px] font-semibold text-[#222222] hover:bg-[#F5F5F1] ${headerFocus}`}
            >
              <span className="truncate">{t('nav.see_all_results', 'See all results for "{query}"').replace('{query}', term)}</span>
              <i aria-hidden="true" className="fa-solid fa-arrow-right text-[13px]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
