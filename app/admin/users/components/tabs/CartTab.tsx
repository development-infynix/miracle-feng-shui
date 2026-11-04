'use client';

import React from 'react';
import type { CartRow } from '../../types';
import { useCustomerSection } from './useCustomerSection';
import { EmptyState, money, productImage, TabBody, TabError, TabLoading, Thumb } from './shared';

export default function CartTab({ userId }: { userId: string }) {
  const { state, retry } = useCustomerSection<CartRow | null>(userId, 'cart');
  const items = state.status === 'ready' ? state.data?.items ?? [] : [];

  const cartCount = items.reduce((sum, it) => sum + it.quantity, 0);
  const cartTotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

  return (
    <>
      <TabBody>
        {state.status === 'loading' && <TabLoading label="cart" />}
        {state.status === 'error' && <TabError label="cart" onRetry={retry} />}
        {state.status === 'ready' && items.length === 0 && (
          <EmptyState icon="fa-solid fa-cart-shopping" text="Cart is empty." />
        )}
        {items.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3">
                <Thumb src={productImage(item.product.images)} alt={item.product.title} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-900" title={item.product.title}>
                    {item.product.title}
                  </p>
                  <p className="text-xs text-stone-500">
                    Qty {item.quantity} · {money(item.product.price)} each
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-stone-900">
                  {money(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        )}
      </TabBody>

      {items.length > 0 && (
        <footer className="flex shrink-0 items-center justify-between border-t border-stone-200 bg-[#fafaf9] px-5 py-4">
          <span className="text-sm text-stone-500">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="text-stone-500">Subtotal</span>
            <span className="font-bold text-stone-900">{money(cartTotal)}</span>
          </span>
        </footer>
      )}
    </>
  );
}
