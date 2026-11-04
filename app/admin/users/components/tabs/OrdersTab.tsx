'use client';

import React from 'react';
import type { OrderRow } from '../../types';
import { useCustomerSection } from './useCustomerSection';
import { EmptyState, formatDate, money, TabBody, TabError, TabLoading, Thumb } from './shared';

export default function OrdersTab({ userId }: { userId: string }) {
  const { state, retry } = useCustomerSection<OrderRow[]>(userId, 'orders');
  const orders = state.status === 'ready' ? state.data : [];
  const ordersTotal = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <>
      <TabBody>
        {state.status === 'loading' && <TabLoading label="orders" />}
        {state.status === 'error' && <TabError label="orders" onRetry={retry} />}
        {state.status === 'ready' && orders.length === 0 && (
          <EmptyState icon="fa-solid fa-box" text="No orders yet." />
        )}
        {orders.length > 0 && (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-stone-900">#{order.orderNumber}</p>
                    <p className="text-xs text-stone-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-600">
                    {order.status}
                  </span>
                </div>
                <div className="mt-2 space-y-1 border-t border-stone-100 pt-2">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-2 text-xs text-stone-700">
                      <Thumb src={it.image} alt={it.title} />
                      <span className="min-w-0 flex-1 truncate" title={it.title}>{it.title}</span>
                      <span className="text-stone-500">× {it.quantity}</span>
                      <span className="font-semibold tabular-nums">{money(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-stone-100 pt-2 text-sm">
                  <span className="text-stone-500">Total</span>
                  <span className="font-bold text-stone-900">{money(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabBody>

      {orders.length > 0 && (
        <footer className="flex shrink-0 items-center justify-between border-t border-stone-200 bg-[#fafaf9] px-5 py-4">
          <span className="text-sm text-stone-500">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="text-stone-500">Subtotal</span>
            <span className="font-bold text-stone-900">{money(ordersTotal)}</span>
          </span>
        </footer>
      )}
    </>
  );
}
