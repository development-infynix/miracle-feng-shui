'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ProductSummary } from '@/lib/placeholder-data';

// The drawer's code only downloads the first time a product is opened.
const ProductDetailsDrawer = dynamic(() => import('./ProductDetailsDrawer'), { ssr: false });

const PRODUCT_PARAM = 'product';

type ProductTarget = string | ProductSummary;

interface ProductDrawerContextType {
  openProduct: (target: ProductTarget) => void;
  closeProduct: () => void;
}

const ProductDrawerContext = createContext<ProductDrawerContextType | undefined>(undefined);

/** The address of a product: the shop with its drawer open. It works when shared or opened in a new tab. */
export function productHref(productId: string) {
  return `/shop?${PRODUCT_PARAM}=${encodeURIComponent(productId)}`;
}

function setProductInUrl(productId: string | null) {
  const url = new URL(window.location.href);
  if (productId) url.searchParams.set(PRODUCT_PARAM, productId);
  else url.searchParams.delete(PRODUCT_PARAM);
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

export function ProductDrawerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Stays set after closing, so the content is still there while the drawer slides out.
  const [current, setCurrent] = useState<{ id: string; seed?: ProductSummary } | null>(null);

  const openProduct = useCallback((target: ProductTarget) => {
    const next = typeof target === 'string' ? { id: target } : { id: target.id, seed: target };
    setCurrent(next);
    setOpen(true);
    setProductInUrl(next.id);
  }, []);

  const closeProduct = useCallback(() => {
    setOpen(false);
    setProductInUrl(null);
  }, []);

  // Opens the drawer when a page loads or is navigated to with a product in its address.
  useEffect(() => {
    const productId = new URLSearchParams(window.location.search).get(PRODUCT_PARAM);
    if (!productId) return;
    setCurrent((existing) => (existing?.id === productId ? existing : { id: productId }));
    setOpen(true);
  }, [pathname]);

  const value = useMemo(() => ({ openProduct, closeProduct }), [openProduct, closeProduct]);

  return (
    <ProductDrawerContext.Provider value={value}>
      {children}
      {current && <ProductDetailsDrawer open={open} onClose={closeProduct} productId={current.id} seed={current.seed} />}
    </ProductDrawerContext.Provider>
  );
}

export function useProductDrawer() {
  const context = useContext(ProductDrawerContext);
  if (!context) throw new Error('useProductDrawer must be used within ProductDrawerProvider');
  return context;
}

type ProductLinkProps = Omit<React.ComponentProps<typeof Link>, 'href' | 'prefetch'> & {
  /** A product opens straight away with what the card already has. An id alone loads everything. */
  product: ProductTarget | null | undefined;
};

/** Opens a product's drawer. It stays a real link, so opening in a new tab still works. */
export function ProductLink({ product, onClick, children, ...props }: ProductLinkProps) {
  const { openProduct } = useProductDrawer();
  const productId = typeof product === 'string' ? product : product?.id;

  return (
    <Link
      {...props}
      href={productId ? productHref(productId) : '/shop'}
      prefetch={false}
      onClick={(e) => {
        onClick?.(e);
        if (!product || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        openProduct(product);
      }}
    >
      {children}
    </Link>
  );
}
