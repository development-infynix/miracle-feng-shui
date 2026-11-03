'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { printIsolatedTaxInvoice, downloadStandaloneTaxInvoice } from '@/lib/invoice';
import { useLocale } from '@/context/CurrencyContext';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  title: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  images?: string[];
  selectedVariations?: any;
  personalizationText?: string;
  slug?: string;
  product?: any;
}

interface UserOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  shippingAddress: string;
  city?: string;
  state?: string;
  pincode?: string;
  total: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  courier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  shopName: string;
  createdAt: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const { formatPrice, t } = useLocale();

  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    async function fetchOrders() {
      if (sessionStatus === 'loading') return;

      if (sessionStatus === 'unauthenticated') {
        // Check if there is a guest order saved from a recent checkout session
        if (typeof window !== 'undefined') {
          const saved = sessionStorage.getItem('last_order');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed && (parsed.orderNumber || parsed.orderId || parsed.id)) {
                const guestOrder: UserOrder = {
                  id: parsed.id || parsed.orderId || 'guest-order',
                  orderNumber: parsed.orderNumber || parsed.orderId || `MFS-${(parsed.id || '100000').slice(-6).toUpperCase()}`,
                  date: parsed.date || (parsed.createdAt ? new Date(parsed.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })),
                  customerName: parsed.customerName || parsed.fullName || parsed.shippingAddress?.name || 'Valued Customer',
                  email: parsed.email || parsed.shippingAddress?.email || '',
                  phone: parsed.phone || parsed.phoneNumber || parsed.shippingAddress?.phone || '',
                  address: typeof parsed.shippingAddress === 'string' ? parsed.shippingAddress : typeof parsed.address === 'string' ? parsed.address : 'Shipping Address Provided',
                  shippingAddress: typeof parsed.shippingAddress === 'string' ? parsed.shippingAddress : typeof parsed.address === 'string' ? parsed.address : 'Shipping Address Provided',
                  total: parsed.totalAmount || parsed.total || 0,
                  totalAmount: parsed.totalAmount || parsed.total || 0,
                  paymentMethod: parsed.paymentMethod || 'Online Payment',
                  paymentStatus: parsed.paymentStatus || 'Paid',
                  status: parsed.status || 'PROCESSING',
                  courier: parsed.courier || 'BlueDart Express',
                  trackingNumber: parsed.trackingNumber || 'IND984210984IN',
                  estimatedDelivery: 'Arriving in 4-7 business days',
                  shopName: 'Miracle Feng Shui Studio',
                  createdAt: parsed.createdAt || new Date().toISOString(),
                  items: (parsed.items || []).map((it: any, idx: number) => ({
                    id: it.id || String(idx),
                    productId: it.productId || it.product?.id || `prod-${idx}`,
                    productName: it.title || it.productName || it.product?.title || it.product?.name || 'Feng Shui Sacred Item',
                    title: it.title || it.productName || it.product?.title || it.product?.name || 'Feng Shui Sacred Item',
                    name: it.title || it.productName || it.product?.title || it.product?.name || 'Feng Shui Sacred Item',
                    price: it.price || it.product?.price || 0,
                    quantity: it.quantity || 1,
                    image: it.image || it.product?.images?.[0] || '/images/miracle.jpeg',
                    slug: it.product?.slug || it.productId || '',
                    product: it.product,
                  })),
                };
                setOrders([guestOrder]);
                setLoading(false);
                return;
              }
            } catch {
              // ignore json parse error
            }
          }
        }
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/orders');
        if (!res.ok) {
          throw new Error('Failed to load orders');
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setOrders(json.data);
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching your orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [sessionStatus]);

  const inProgressOrders = orders.filter((o) =>
    ['PENDING', 'COD_PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'Dispatched'].includes(o.status)
  );
  const completedOrders = orders.filter((o) => ['DELIVERED', 'Delivered'].includes(o.status));
  const cancelledOrders = orders.filter((o) => ['CANCELLED', 'Cancelled'].includes(o.status));

  const filteredOrders =
    activeTab === 'all'
      ? orders
      : activeTab === 'in-progress'
      ? inProgressOrders
      : activeTab === 'completed'
      ? completedOrders
      : cancelledOrders;

  const handleOpenInvoice = (order: UserOrder, mode: 'view' | 'download') => {
    const invoicePayload = {
      orderId: order.orderNumber || order.id,
      orderDate: order.date,
      customerName: order.customerName || session?.user?.name || 'Valued Customer',
      customerEmail: order.email || session?.user?.email || '',
      customerPhone: order.phone || '',
      deliveryAddress: order.shippingAddress || order.address || 'Address provided at checkout',
      paymentMethod: order.paymentMethod || 'Online Payment',
      paymentStatus: order.paymentStatus || 'Paid in Full',
      totalAmount: order.total || order.totalAmount || 0,
      items: order.items.map((it) => ({
        name: it.title || it.name || it.productName || 'Feng Shui Sacred Item',
        quantity: it.quantity || 1,
        price: it.price || 0,
        maker: order.shopName || 'Miracle Feng Shui Studio',
      })),
    };

    if (mode === 'download') {
      downloadStandaloneTaxInvoice(invoicePayload);
    } else {
      printIsolatedTaxInvoice(invoicePayload);
    }
  };

  return (
    <div className="bg-[#FAF9F7] min-h-[calc(100vh-140px)] pb-24 text-[#111111]">
      <div className="etsy-container py-8 sm:py-12 max-w-[960px] mx-auto px-4 sm:px-6">
        {/* Minimal Editorial Page Header */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[26px] sm:text-[32px] font-serif font-bold text-[#111111] tracking-tight">
              Purchases &amp; Orders
            </h1>
            <p className="text-[13.5px] text-gray-500 mt-1">
              Track your authentic consecrated Feng Shui shipments, reorder items, and access official tax invoices.
            </p>
          </div>

          <Link
            href="/shop"
            className="text-[13px] font-medium text-[#111111] hover:underline flex items-center gap-1.5"
          >
            <span>Continue shopping</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Unauthenticated Prompt */}
        {sessionStatus === 'unauthenticated' && orders.length === 0 && (
          <div className="bg-white border border-gray-200/90 rounded-2xl p-8 sm:p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] mb-8">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF9F5] border border-gray-200 flex items-center justify-center text-gray-700 mb-4">
              <i className="fa-solid fa-lock text-xl" />
            </div>
            <h2 className="text-[20px] font-bold text-[#111111] mb-2">Sign in to view your orders</h2>
            <p className="text-[14px] text-gray-500 max-w-md mx-auto mb-6">
              Sign in with your account to access your unique order history, live parcel tracking, and invoices.
            </p>
            <Link
              href="/login?callbackUrl=/my-orders"
              style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
              className="inline-block px-8 py-3 rounded-full bg-[#111111] hover:bg-black text-white text-[13.5px] font-semibold transition-all shadow-xs no-underline"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {/* Minimal Clean Tabs */}
        {(sessionStatus === 'authenticated' || orders.length > 0) && (
          <div className="flex items-center gap-6 border-b border-gray-200 pb-2 mb-8 text-[13.5px] overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-2 font-medium transition-colors cursor-pointer whitespace-nowrap relative ${
                activeTab === 'all'
                  ? 'text-[#111111] font-semibold after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]'
                  : 'text-gray-500 hover:text-[#111111]'
              }`}
            >
              All orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('in-progress')}
              className={`pb-2 font-medium transition-colors cursor-pointer whitespace-nowrap relative ${
                activeTab === 'in-progress'
                  ? 'text-[#111111] font-semibold after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]'
                  : 'text-gray-500 hover:text-[#111111]'
              }`}
            >
              In progress ({inProgressOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`pb-2 font-medium transition-colors cursor-pointer whitespace-nowrap relative ${
                activeTab === 'completed'
                  ? 'text-[#111111] font-semibold after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]'
                  : 'text-gray-500 hover:text-[#111111]'
              }`}
            >
              Completed ({completedOrders.length})
            </button>
            {cancelledOrders.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('cancelled')}
                className={`pb-2 font-medium transition-colors cursor-pointer whitespace-nowrap relative ${
                  activeTab === 'cancelled'
                    ? 'text-[#111111] font-semibold after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]'
                    : 'text-gray-500 hover:text-[#111111]'
                }`}
              >
                Cancelled ({cancelledOrders.length})
              </button>
            )}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden p-6 animate-pulse space-y-4"
              >
                <div className="h-6 bg-gray-100 rounded w-1/3" />
                <div className="h-20 bg-gray-50 rounded" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-[13.5px] mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="text-red-700 underline font-semibold text-[13px]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State when logged in but no orders exist */}
        {!loading && (sessionStatus === 'authenticated' || orders.length === 0) && filteredOrders.length === 0 && (
          <div className="bg-white border border-gray-200/90 rounded-2xl p-10 sm:p-14 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF9F5] border border-gray-200 flex items-center justify-center text-gray-400 mb-4">
              <i className="fa-solid fa-bag-shopping text-2xl" />
            </div>
            <h2 className="text-[22px] font-serif font-bold text-[#111111] mb-2">
              {activeTab === 'all'
                ? 'No orders placed yet'
                : activeTab === 'in-progress'
                ? 'No in-progress orders'
                : activeTab === 'completed'
                ? 'No completed orders'
                : 'No cancelled orders'}
            </h2>
            <p className="text-[14px] text-gray-500 max-w-md mx-auto mb-6">
              {activeTab === 'all'
                ? 'When you purchase Feng Shui crystals, statues, or sacred cures, your orders and live tracking will appear here.'
                : `You currently have no orders in the ${activeTab} tab.`}
            </p>
            <Link
              href="/shop"
              style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
              className="inline-block px-8 py-3 rounded-full bg-[#111111] hover:bg-black text-white text-[13.5px] font-semibold transition-all shadow-xs no-underline"
            >
              Discover Sacred Finds
            </Link>
          </div>
        )}

        {/* Orders List for Logged-In User */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const isDelivered = order.status === 'DELIVERED' || order.status === 'Delivered';
              const isCancelled = order.status === 'CANCELLED' || order.status === 'Cancelled';

              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all hover:border-gray-300"
                >
                  {/* Structured Metadata Header Bar */}
                  <div className="bg-[#FBFBFA] border-b border-gray-100 px-6 py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12.5px]">
                      <div>
                        <span className="block text-gray-400 font-medium uppercase tracking-wider text-[10.5px]">
                          Order placed
                        </span>
                        <span className="font-medium text-[#111111]">{order.date}</span>
                      </div>

                      <div>
                        <span className="block text-gray-400 font-medium uppercase tracking-wider text-[10.5px]">
                          Total
                        </span>
                        <span className="font-semibold text-[#111111]">
                          {formatPrice(order.total || order.totalAmount)}
                        </span>
                      </div>

                      <div>
                        <span className="block text-gray-400 font-medium uppercase tracking-wider text-[10.5px]">
                          Ship to
                        </span>
                        <span
                          className="font-medium text-[#111111] truncate block max-w-[170px]"
                          title={order.shippingAddress || order.address}
                        >
                          {order.shippingAddress || order.address || order.customerName}
                        </span>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="block text-gray-400 font-medium uppercase tracking-wider text-[10.5px]">
                          Order #{order.orderNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(order, 'view')}
                          className="font-medium text-[#111111] hover:underline cursor-pointer text-[12px]"
                        >
                          View invoice
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Status & Item Body */}
                  <div className="p-6 sm:p-7 space-y-6">
                    {/* Live Delivery Status Indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            isDelivered
                              ? 'bg-emerald-500'
                              : isCancelled
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="font-semibold text-[15px] text-[#111111]">
                          {isCancelled ? 'Order Cancelled' : order.estimatedDelivery || order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[12.5px] text-gray-500">
                        <span>
                          {order.courier}:{' '}
                          <strong className="text-[#111111] font-mono">{order.trackingNumber}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              `Live Tracking for ${order.trackingNumber}:\nCarrier: ${order.courier}\nStatus: ${order.status}\nEstimated Delivery: ${order.estimatedDelivery}`
                            )
                          }
                          className="text-[#111111] font-medium hover:underline cursor-pointer"
                        >
                          Track
                        </button>
                      </div>
                    </div>

                    {/* Items in this Order */}
                    <div className="divide-y divide-gray-100">
                      {(order.items || []).map((it, idx) => {
                        const productUrl = it.slug
                          ? `/product/${it.slug}`
                          : it.productId
                          ? `/product/${it.productId}`
                          : `/shop`;

                        return (
                          <div
                            key={it.id || idx}
                            className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start justify-between gap-5"
                          >
                            <div className="flex gap-4 sm:gap-5 flex-grow">
                              <Link
                                href={productUrl}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-200/80 shrink-0 block group"
                              >
                                <img
                                  src={it.image || '/images/miracle.jpeg'}
                                  alt={it.title || it.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/miracle.jpeg';
                                  }}
                                />
                              </Link>

                              <div className="space-y-1.5 flex-grow">
                                <span className="text-[12px] text-gray-500 font-medium block">
                                  Sold by {order.shopName || 'Miracle Feng Shui Studio'}
                                </span>
                                <Link
                                  href={productUrl}
                                  className="text-[14.5px] sm:text-[15.5px] font-medium text-[#111111] hover:underline line-clamp-2 leading-snug"
                                >
                                  {it.title || it.name || it.productName}
                                </Link>
                                <div className="flex items-center gap-3 text-[13px] pt-0.5">
                                  <span className="font-semibold text-[#111111]">
                                    {formatPrice(it.price * (it.quantity || 1))}
                                  </span>
                                  <span className="text-gray-400">&bull;</span>
                                  <span className="text-gray-500">Qty: {it.quantity || 1}</span>
                                </div>
                              </div>
                            </div>

                            {/* Clean Action Buttons */}
                            <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-2 w-full sm:w-[140px] pt-1 sm:pt-0 shrink-0">
                              <Link
                                href={productUrl}
                                style={{ color: '#ffffff', backgroundColor: '#111111' }}
                                className="w-full text-center px-4 py-2.5 bg-[#111111] hover:bg-black text-white text-[13px] font-semibold rounded-xl transition-all shadow-xs no-underline flex items-center justify-center"
                              >
                                Buy again
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Minimal Footer Row: Contact Shop & Invoice */}
                    <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-[12.5px]">
                      <a
                        href={`mailto:care@miraclefengshui.com?subject=Inquiry%20regarding%20Order%20${order.orderNumber}`}
                        className="text-gray-500 hover:text-[#111111] hover:underline cursor-pointer"
                      >
                        Need help with this order? Contact shop
                      </a>

                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              `Official Certificate of Authenticity & Consecration for Order #${order.orderNumber} is verified and certified by Miracle Feng Shui Studio.`
                            )
                          }
                          className="text-gray-600 hover:text-[#111111] hover:underline cursor-pointer"
                        >
                          Certificate of Authenticity
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(order, 'download')}
                          className="text-gray-600 hover:text-[#111111] hover:underline cursor-pointer"
                        >
                          Download Invoice (PDF)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
