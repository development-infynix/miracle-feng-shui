'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import OrdersToolbar from './components/OrdersToolbar';
import OrdersFooter from './components/OrdersFooter';
import OrderCard from './components/OrderCard';
import OrdersTable from './components/OrdersTable';
import ViewOrderDrawer from './components/ViewOrderDrawer';
import { OrderItemData, OrderStats } from './types';

interface OrdersClientProps {
  initialOrders: OrderItemData[];
  search?: string;
  status?: string;
}

const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancellation Requested', 'Cancellation Approved', 'Cancelled'];
const isCancelled = (o: OrderItemData) => o.status === 'Cancelled' || o.status === 'Cancellation Approved';

function ordersUrl(search: string, status: string) {
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (status && status !== 'All') params.set('status', status.toUpperCase());
  const qs = params.toString();
  return qs ? `/admin/orders?${qs}` : '/admin/orders';
}

function computeStats(orders: OrderItemData[]): OrderStats {
  const byStatus: OrderStats['byStatus'] = {
    Pending: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    'Cancellation Requested': 0,
    'Cancellation Approved': 0,
    Cancelled: 0,
  };
  for (const o of orders) byStatus[o.status] += 1;

  const settledBalance = orders
    .filter((o) => {
      if (isCancelled(o)) return false;
      const method = (o.paymentMethod || '').toLowerCase();
      const isOnline = method.includes('online') || method.includes('upi') || method.includes('razorpay');
      const isDeliveredCod = o.status === 'Delivered' && (method.includes('cash') || method.includes('cod'));
      return isOnline || isDeliveredCod;
    })
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingBalance = orders
    .filter((o) => {
      if (isCancelled(o) || o.status === 'Delivered') return false;
      const method = (o.paymentMethod || '').toLowerCase();
      const isCod = method.includes('cash') || method.includes('cod');
      return isCod;
    })
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalRevenue = orders
    .filter((o) => !isCancelled(o))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    total: orders.length,
    totalRevenue,
    settledBalance,
    pendingBalance,
    byStatus,
  };
}

export default function OrdersClient({ initialOrders, search = '', status: statusProp }: OrdersClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  // The URL status arrives in DB case (PENDING). Map it back to the UI label.
  const initialStatus = (() => {
    if (!statusProp) return 'All';
    const upper = statusProp.toUpperCase();
    const match = VALID_STATUSES.find((s) => s.toUpperCase() === upper);
    return match || 'All';
  })();

  const [orders, setOrders] = useState<OrderItemData[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [viewOrder, setViewOrder] = useState<OrderItemData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // This page has its own scrolling list, so the document itself shouldn't scroll.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Keep the URL in sync when the user types or picks a status.
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [orders]);

  useEffect(() => {
    const term = searchQuery.trim();
    // Only navigate when the controls differ from the URL, so a page load never redirects.
    if (term === (search || '') && selectedStatus === initialStatus) {
      return;
    }
    const timer = setTimeout(() => {
      startTransition(() => router.replace(ordersUrl(term, selectedStatus)));
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedStatus, search, statusProp, initialStatus]);

  const stats = computeStats(initialOrders);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      className="flex flex-col gap-4 h-screen overflow-hidden -mx-3 -my-5 sm:-mx-4 lg:-mx-5"
    >
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20">
          <i className="fa-solid fa-circle-check text-emerald-400 text-base" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <OrdersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        counts={{ total: stats.total, byStatus: stats.byStatus }}
      />

      <div ref={listRef} className="relative flex-1 min-h-0 overflow-y-auto scroll-smooth px-4 py-2">
        {isPending && (
          <div className="absolute inset-0 z-40 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-700" />
          </div>
        )}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm shadow-2xs">
            {search || selectedStatus !== 'All'
              ? 'No orders found matching your search.'
              : 'No orders yet. New orders will appear here.'}
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <OrdersTable orders={orders} onView={setViewOrder} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:hidden gap-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} onView={setViewOrder} />
              ))}
            </div>
          </>
        )}
      </div>

      <OrdersFooter
        total={stats.total}
        settledBalance={stats.settledBalance}
        pendingBalance={stats.pendingBalance}
      />

      {viewOrder && (
        <ViewOrderDrawer
          key={viewOrder.id}
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onSaved={(updated) => {
            setViewOrder(updated);
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            showToast(`Order ${updated.orderNumber} updated.`);
            startTransition(() => router.refresh());
          }}
          onDeleted={(orderId) => {
            setViewOrder(null);
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
            showToast('Order deleted.');
            startTransition(() => router.refresh());
          }}
        />
      )}
    </div>
  );
}
