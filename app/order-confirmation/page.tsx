'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/context/CurrencyContext';
import {
  TaxInvoiceData,
  printIsolatedTaxInvoice,
  downloadStandaloneTaxInvoice,
} from '@/lib/invoice';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maker?: string;
  sku?: string;
  variant?: string;
  slug?: string;
}

interface OrderData {
  id?: string;
  orderId?: string;
  orderNumber?: string;
  date?: string;
  createdAt?: string;
  email?: string;
  fullName?: string;
  customerName?: string;
  address?: string;
  shippingAddress?: string | {
    name?: string;
    phone?: string;
    email?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  phone?: string;
  phoneNumber?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  total?: number;
  totalAmount?: number;
  estimatedDelivery?: string;
  courier?: string;
  trackingNumber?: string;
  shopName?: string;
  items?: Array<{
    id?: string;
    title?: string;
    productName?: string;
    name?: string;
    price?: number;
    quantity?: number;
    image?: string;
    sku?: string;
    variant?: string;
    slug?: string;
    product?: {
      id?: string;
      name?: string;
      title?: string;
      price?: number;
      maker?: string;
      images?: string[];
      sku?: string;
      slug?: string;
    };
  }>;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { formatPrice } = useLocale();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      const queryParam =
        searchParams.get('orderNumber') ||
        searchParams.get('orderId') ||
        searchParams.get('id');

      let sessionStored: any = null;
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('last_order');
        if (stored) {
          try {
            sessionStored = JSON.parse(stored);
          } catch {}
        }
      }

      const identifier = queryParam || sessionStored?.orderNumber || sessionStored?.orderId || sessionStored?.id;

      if (identifier) {
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(identifier)}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setOrder(json.data);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('API order fetch error, checking session cache:', err);
        }

        // Fallback to session cache if network / API returned 404
        if (sessionStored) {
          setOrder(sessionStored);
          setLoading(false);
          return;
        }
      } else if (sessionStored) {
        setOrder(sessionStored);
        setLoading(false);
        return;
      }

      // No order found in query param or session storage
      setOrder(null);
      setLoading(false);
    }

    loadOrder();
  }, [searchParams]);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-20 px-4 text-[#222222]">
        <div className="w-12 h-12 rounded-full border-3 border-amber-600 border-t-transparent animate-spin mb-4" />
        <p className="text-[14px] text-gray-500 font-medium">Loading your confirmed order details...</p>
      </div>
    );
  }

  // No Order Found State (NO dummy data rendered)
  if (!order) {
    return (
      <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-16 px-4 text-[#222222]">
        <div className="max-w-md w-full text-center bg-white border border-gray-200/90 rounded-3xl p-8 sm:p-10 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#FAF9F5] border border-gray-200 flex items-center justify-center text-gray-700 mx-auto mb-5 shadow-2xs">
            <i className="fa-solid fa-receipt text-xl text-amber-700" />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#111111] mb-2">
            No Recent Order Found
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mb-7 leading-relaxed">
            We could not find an active checkout session for this device. If you have recently purchased an item, you can access your order receipts and tracking anytime in Purchases &amp; Orders.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/my-orders"
              style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all text-center"
            >
              View My Orders
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-all text-center"
            >
              Explore Sacred Finds
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Compute dynamic order fields from the real API data
  const orderId = order.orderNumber || order.orderId || order.id || 'MFS-ORDER';

  const now = new Date();
  const rawDate = order.createdAt ? new Date(order.createdAt) : now;
  const orderedDateStr = rawDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const deliveryStart = new Date(rawDate);
  deliveryStart.setDate(rawDate.getDate() + 4);
  const deliveryEnd = new Date(rawDate);
  deliveryEnd.setDate(rawDate.getDate() + 8);

  const deliveryRangeStr =
    order.estimatedDelivery ||
    `${deliveryStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${deliveryEnd.toLocaleDateString('en-US', {
      day: 'numeric',
    })}`;

  const fullOrderDate =
    order.date ||
    rawDate.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const customerName =
    order.customerName ||
    order.fullName ||
    (typeof order.shippingAddress === 'object' ? order.shippingAddress?.name : undefined) ||
    session?.user?.name ||
    'Valued Customer';

  const customerEmail =
    order.email ||
    (typeof order.shippingAddress === 'object' ? order.shippingAddress?.email : undefined) ||
    session?.user?.email ||
    '';

  const customerPhone =
    order.phone ||
    order.phoneNumber ||
    (typeof order.shippingAddress === 'object' ? order.shippingAddress?.phone : undefined) ||
    '';

  const shippingAddrObj =
    typeof order.shippingAddress === 'object' && order.shippingAddress ? order.shippingAddress : null;

  const deliveryAddress =
    typeof order.address === 'string' && order.address.trim()
      ? order.address
      : typeof order.shippingAddress === 'string' && order.shippingAddress.trim()
      ? order.shippingAddress
      : shippingAddrObj
      ? `${shippingAddrObj.line1 || ''}${
          shippingAddrObj.line2 ? ', ' + shippingAddrObj.line2 : ''
        }, ${shippingAddrObj.city || ''}, ${shippingAddrObj.state || ''} - ${
          shippingAddrObj.pincode || ''
        }, ${shippingAddrObj.country || 'India'}`
      : 'Address provided at checkout';

  const totalAmount = order.totalAmount ?? order.total ?? 0;

  const paymentMethod =
    order.paymentMethod === 'COD' || order.paymentMethod === 'Cash on Delivery'
      ? 'Cash on Delivery'
      : order.paymentMethod === 'RAZORPAY' || order.paymentMethod === 'UPI / Online Payment'
      ? 'UPI / Online Payment'
      : order.paymentMethod || 'Online Payment';

  const paymentStatus =
    order.paymentStatus ||
    (paymentMethod === 'Cash on Delivery' ? 'Pay on Delivery' : 'Paid in Full');

  // Real line items from the API order
  const items: OrderItem[] = (order.items || []).map((item, idx) => ({
    id: item.id || String(idx),
    name:
      item.title ||
      item.name ||
      item.productName ||
      item.product?.title ||
      item.product?.name ||
      'Feng Shui Sacred Item',
    price: item.price ?? item.product?.price ?? 0,
    quantity: item.quantity || 1,
    image: item.image || item.product?.images?.[0] || '/images/miracle.jpeg',
    maker: item.product?.maker || order.shopName || 'Miracle Feng Shui Studio',
    sku: item.sku || item.product?.sku || `MFS-SKU-${idx + 1}`,
    variant: item.variant,
    slug: item.slug || item.product?.slug,
  }));

  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const gstAmount = Math.round((totalAmount * 18) / 118);
  const subtotalAmount = totalAmount - gstAmount;

  const invoiceData: TaxInvoiceData = {
    orderId,
    orderDate: fullOrderDate,
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    paymentMethod,
    paymentStatus,
    totalAmount,
    items,
  };

  return (
    <div className="w-full bg-white min-h-[calc(100vh-140px)] flex flex-col items-center py-10 sm:py-14 px-4 sm:px-6 pb-28 text-[#222222] font-sans antialiased">
      <div className="w-full max-w-[620px] flex flex-col items-center mx-auto">
        {/* Celebration Header */}
        <div className="w-full text-center mb-7">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 mb-2.5">
            <div className="flex items-center gap-1 text-[#E6A024] select-none text-[18px] sm:text-[22px] -rotate-6">
              <span>★</span>
              <span className="text-[13px] sm:text-[15px] -mt-2">★</span>
            </div>

            <h1 className="text-[24px] sm:text-[30px] font-bold text-[#222222] tracking-tight leading-tight">
              Woohoo! Your order is confirmed.
            </h1>

            <div className="flex items-center gap-1 text-[#E6A024] select-none text-[18px] sm:text-[22px] rotate-6">
              <span className="text-[13px] sm:text-[15px] -mt-2">★</span>
              <span>★</span>
            </div>
          </div>

          <p className="text-[14px] text-[#222222] leading-relaxed max-w-[480px] mx-auto">
            We&apos;ve sent a confirmation email to{' '}
            <strong className="font-semibold text-[#111111]">{customerEmail || 'your email on file'}</strong>.
            All sacred cures are blessed and purified with sandalwood incense before delivery.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="w-full bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-8">
          <div className="p-5 sm:p-6 border-b border-[#EFEFEF] bg-[#FAF9F5]/40 flex flex-wrap items-center justify-between gap-3 text-[13px]">
            <div>
              <span className="text-gray-400 text-[11px] block uppercase font-medium tracking-wider">
                Order Number
              </span>
              <span className="font-bold text-[#111111] font-mono text-[14px]">#{orderId}</span>
            </div>

            <div className="text-right">
              <span className="text-gray-400 text-[11px] block uppercase font-medium tracking-wider">
                Estimated Delivery
              </span>
              <span className="font-semibold text-emerald-700 text-[13px]">{deliveryRangeStr}</span>
            </div>
          </div>

          {/* Line items list */}
          <div className="p-5 sm:p-7 divide-y divide-gray-100">
            {items.map((it, idx) => (
              <div key={it.id || idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/miracle.jpeg';
                    }}
                  />
                </div>

                <div className="flex-grow space-y-1">
                  <span className="text-[11px] text-gray-400 font-medium block">
                    Sold by {it.maker || 'Miracle Feng Shui Studio'}
                  </span>
                  <h4 className="text-[13.5px] sm:text-[14.5px] font-semibold text-[#111111] line-clamp-2 leading-snug">
                    {it.name}
                  </h4>
                  {it.variant && (
                    <span className="text-[11px] text-gray-500 block">
                      Variation: {it.variant}
                    </span>
                  )}
                  <div className="flex items-center gap-2 pt-0.5 text-[12.5px]">
                    <span className="font-bold text-[#111111]">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                    <span className="text-gray-400">&bull;</span>
                    <span className="text-gray-500">Qty: {it.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Payment Summary */}
          <div className="p-5 sm:p-7 bg-[#FBFBFA] border-t border-gray-100 space-y-3 text-[12.5px]">
            <div className="flex justify-between items-start gap-4">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="font-medium text-[#111111] text-right max-w-[320px]">{deliveryAddress}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Payment Method:</span>
              <span className="font-medium text-[#111111]">{paymentMethod}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Payment Status:</span>
              <span className="font-semibold text-emerald-700">{paymentStatus}</span>
            </div>

            <div className="pt-2 border-t border-gray-200/80 flex justify-between items-center text-[14px]">
              <span className="font-bold text-[#111111]">Total Paid:</span>
              <span className="font-bold text-[#111111] text-[16px]">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Primary and Secondary CTA Buttons */}
        <div className="w-full flex flex-col items-center gap-3">
          <Link
            href="/my-orders"
            style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
            className="w-full sm:w-auto px-9 py-3 rounded-full bg-[#111111] hover:bg-black text-white text-[13.5px] font-semibold transition-all shadow-xs text-center no-underline"
          >
            View Your Purchases &amp; Orders
          </Link>

          {/* Standalone invoice actions */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => downloadStandaloneTaxInvoice(invoiceData)}
              className="px-4 py-2 rounded-full border border-[#DEDEDE] hover:border-[#111111] bg-white text-[#111111] text-[12px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
            >
              <i className="fa-solid fa-arrow-down-to-bracket text-[11px]" />
              <span>Download Tax Invoice (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => printIsolatedTaxInvoice(invoiceData)}
              className="px-4 py-2 rounded-full border border-[#DEDEDE] hover:border-[#111111] bg-white text-[#111111] text-[12px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
            >
              <i className="fa-solid fa-print text-[11px]" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-20 px-4 text-[#222222]">
          <div className="w-12 h-12 rounded-full border-3 border-amber-600 border-t-transparent animate-spin mb-4" />
          <p className="text-[14px] text-gray-500 font-medium">Loading confirmed order...</p>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
