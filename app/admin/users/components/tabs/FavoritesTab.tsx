'use client';

import React from 'react';
import type { FavoriteRow } from '../../types';
import { useCustomerSection } from './useCustomerSection';
import { EmptyState, formatDate, money, productImage, TabBody, TabError, TabLoading, Thumb } from './shared';

export default function FavoritesTab({ userId }: { userId: string }) {
  const { state, retry } = useCustomerSection<FavoriteRow[]>(userId, 'favorites');

  return (
    <TabBody>
      {state.status === 'loading' && <TabLoading label="favorites" />}
      {state.status === 'error' && <TabError label="favorites" onRetry={retry} />}
      {state.status === 'ready' && state.data.length === 0 && (
        <EmptyState icon="fa-regular fa-heart" text="No favorites yet." />
      )}
      {state.status === 'ready' && state.data.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {state.data.map((fav) => (
            <div key={fav.id} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3">
              <Thumb src={productImage(fav.product.images)} alt={fav.product.title} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-900" title={fav.product.title}>
                  {fav.product.title}
                </p>
                <p className="text-xs text-stone-500">Added {formatDate(fav.createdAt)}</p>
              </div>
              <span className="shrink-0 text-sm font-bold text-stone-900">{money(fav.product.price)}</span>
            </div>
          ))}
        </div>
      )}
    </TabBody>
  );
}
