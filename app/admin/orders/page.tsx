'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore, StoreOrder, OrderStatus } from '@/context/StoreContext';

export default function AdminOrdersPage() {
  const {
    orders,
    refreshOrders,
    updateOrderStatus,
    confirmOrder,
    deleteOrder,
    ordersLeftToConfirm,
    ordersLeftToPack,
    ordersInTransit,
    settledBalance,
    pendingBalance,
    totalOrderRevenue,
  } = useStore();

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingOrder, setViewingOrder] = useState<StoreOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const statusList: ('All' | OrderStatus)[] = [
    'All',
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  const statusBadgeStyle: Record<OrderStatus, string> = {
    Pending: 'bg-[#FEF7EE] text-[#B45309] border border-[#FED7AA]',
    Processing: 'bg-[#F0F5FA] text-[#1D4ED8] border border-blue-200',
    Shipped: 'bg-[#F6F2FC] text-[#6B21A8] border border-purple-200',
    Delivered: 'bg-[#F0F7F5] text-[#115E59] border border-teal-200',
    Cancelled: 'bg-[#FDF4F0] text-[#B91C1C] border border-rose-200',
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus =
        selectedStatus === 'All' || o.status === selectedStatus;
      const matchesQuery =
        !searchQuery ||
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.phone.includes(searchQuery);
      return matchesStatus && matchesQuery;
    });
  }, [orders, selectedStatus, searchQuery]);

  return (
    <div
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      className="flex flex-col gap-6"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <i className="fa-solid fa-circle-check text-emerald-400 text-base" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Search Bar Only */}
      <div className="bg-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl sm:rounded-full border border-gray-200/80 shadow-xs flex items-center gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search orders, customer, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-full border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-hidden focus:border-black transition-all"
          />
        </div>
      </div>

      {/* Luxury Noir Salon-Style Hero Page Banner with Right-Side Fade Image */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#161619] p-5 sm:p-7 md:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 min-h-[160px] sm:min-h-[190px]">
        {/* Right-Side Photo with Seamless Noir Blend Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden select-none">
          <img
            src="/images/feng_shui_hero_banner.jpg"
            alt="Miracle Orders Sanctuary"
            className="w-full h-full object-cover object-right brightness-[0.7] contrast-[1.08]"
          />
          {/* Seamless Left Fade Gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #161619 0%, #161619 12%, rgba(22, 22, 25, 0.85) 42%, rgba(22, 22, 25, 0.25) 75%, transparent 100%)',
            }}
          />
          {/* Subtle Top & Bottom Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(22, 22, 25, 0.35) 0%, transparent 25%, transparent 75%, rgba(22, 22, 25, 0.5) 100%)',
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Date Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white/90 text-[10px] sm:text-[10.5px] font-mono tracking-[0.14em] uppercase font-semibold mb-2 shadow-2xs backdrop-blur-xs">
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase()}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1
            style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
            className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white leading-tight"
          >
            Orders Management
          </h1>
          <p
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl font-normal leading-relaxed"
          >
            Track customer deliveries, manage warehouse dispatch, and inspect live COD &amp; online balances.
          </p>
        </div>

        {/* Horizontal Navigation Pills with Icons on the Black Banner */}
        <div className="relative z-10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <a
            href="/admin"
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all no-underline shadow-2xs whitespace-nowrap"
          >
            <i className="fa-regular fa-user text-xs text-white/80" />
            <span>Dashboard</span>
          </a>

          <a
            href="/admin/orders"
            style={{ backgroundColor: '#FFFFFF', color: '#111111' }}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-black text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 shadow-md no-underline whitespace-nowrap"
          >
            <i className="fa-solid fa-bag-shopping text-xs text-black" />
            <span>My Orders ({orders.length})</span>
          </a>

          <a
            href="/admin/products"
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all no-underline shadow-2xs whitespace-nowrap"
          >
            <i className="fa-solid fa-boxes-stacked text-xs text-white/80" />
            <span>Catalog</span>
          </a>

          <a
            href="/admin/categories"
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all no-underline shadow-2xs whitespace-nowrap"
          >
            <i className="fa-solid fa-tags text-xs text-white/80" />
            <span>Categories</span>
          </a>

          <a
            href="/admin/homepage"
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all no-underline shadow-2xs whitespace-nowrap"
          >
            <i className="fa-solid fa-layer-group text-xs text-white/80" />
            <span>Sections</span>
          </a>
        </div>
      </div>

      {/* Main 2-Column Wink Layout: Left Status Sidebar + Right Order Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* LEFT COLUMN / MOBILE TOP: Status Filters & Financial Overview */}
        <aside className="lg:col-span-3 flex flex-col gap-3">
          {/* Status Filter Container */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs flex flex-col gap-2">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-gray-400 uppercase tracking-wider px-1 sm:px-2 pt-0.5">
              Order Status Filter
            </span>

            {/* Mobile: Horizontal scrollable pills. Desktop: Vertical stack */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {statusList.map((st) => {
                const count = st === 'All' ? orders.length : orders.filter((o) => o.status === st).length;
                const isSel = selectedStatus === st;
                const label =
                  st === 'All'
                    ? 'All Orders'
                    : st === 'Processing'
                    ? 'On Shipping'
                    : st === 'Delivered'
                    ? 'Arrived'
                    : st === 'Cancelled'
                    ? 'Canceled'
                    : st;

                const statusIcon =
                  st === 'All'
                    ? 'fa-solid fa-list-check'
                    : st === 'Pending'
                    ? 'fa-solid fa-clock'
                    : st === 'Processing'
                    ? 'fa-solid fa-truck-fast'
                    : st === 'Shipped'
                    ? 'fa-solid fa-paper-plane'
                    : st === 'Delivered'
                    ? 'fa-solid fa-circle-check'
                    : st === 'Cancelled'
                    ? 'fa-solid fa-circle-xmark'
                    : 'fa-solid fa-circle';

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    style={
                      isSel
                        ? { backgroundColor: '#111111', color: '#FFFFFF', borderColor: '#111111' }
                        : { backgroundColor: '#FFFFFF', color: '#374151', borderColor: '#E5E7EB' }
                    }
                    className={`shrink-0 lg:w-full px-3.5 lg:px-5 py-2 lg:py-3 rounded-full text-xs font-semibold flex items-center justify-between gap-2.5 transition-all cursor-pointer border whitespace-nowrap ${
                      isSel
                        ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200/90 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <i className={`${statusIcon} text-xs ${isSel ? 'text-white' : 'text-gray-400'}`} />
                      <span className="font-semibold">{label}</span>
                    </div>
                    <span
                      style={
                        isSel
                          ? { backgroundColor: '#FFFFFF', color: '#111111' }
                          : { backgroundColor: '#F3F4F6', color: '#4B5563' }
                      }
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Financial Summary: 2-col on mobile, stacked on desktop */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs flex flex-col gap-2.5 sm:gap-3">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-gray-400 uppercase tracking-wider px-1 sm:px-2">
              Financial Summary
            </span>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
              <div className="bg-gray-50/70 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-100">
                <span className="text-[9.5px] sm:text-[10.5px] font-semibold text-emerald-700 block uppercase tracking-wider">
                  Settled (In-Hand)
                </span>
                <div className="text-base sm:text-lg font-bold text-gray-900 mt-0.5 truncate">
                  ₹{settledBalance.toLocaleString('en-IN')}
                </div>
                <span className="text-[9.5px] sm:text-[10px] text-gray-400 block mt-0.5 truncate">
                  Delivered + Online
                </span>
              </div>

              <div className="bg-gray-50/70 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-100">
                <span className="text-[9.5px] sm:text-[10.5px] font-semibold text-gray-500 block uppercase tracking-wider">
                  Pending COD
                </span>
                <div className="text-base sm:text-lg font-bold text-gray-900 mt-0.5 truncate">
                  ₹{pendingBalance.toLocaleString('en-IN')}
                </div>
                <span className="text-[9.5px] sm:text-[10px] text-gray-400 block mt-0.5 truncate">
                  Awaiting delivery
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Stream of Wink Order Cards */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-gray-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <i className="fa-solid fa-box-open text-lg" />
              </div>
              <h3 className="font-bold text-base text-gray-900">No orders found</h3>
              <p className="text-xs text-gray-500 mt-1">
                There are no orders matching status &ldquo;{selectedStatus}&rdquo; or your search query.
              </p>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const totalItemsCount = ord.items.reduce((sum, it) => sum + it.quantity, 0);

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-gray-200/80 shadow-xs hover:shadow-sm transition-all"
                >
                  {/* Card Header: Order ID + Tracking Path + Estimated Arrival / Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-5 border-b border-gray-100 gap-3 sm:gap-4">
                    {/* Order ID & Customer */}
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Order ID
                      </span>
                      <div className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mt-0.5">
                        <i className="fa-solid fa-bag-shopping text-sm text-gray-700 shrink-0" />
                        <span className="truncate">{ord.orderNumber}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                        <i className="fa-regular fa-user text-[11px] text-gray-400 shrink-0" />
                        <span className="font-semibold text-gray-800">{ord.customerName}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-gray-600">{ord.phone}</span>
                      </div>
                    </div>

                    {/* Dotted Tracking Route (Desktop) */}
                    <div className="hidden md:flex items-center gap-2.5 text-xs text-gray-600 bg-gray-50/80 px-4 py-2 rounded-full border border-gray-100 shrink-0">
                      <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                        <i className="fa-solid fa-building text-gray-400 text-xs" />
                        <span>Miracle Temple</span>
                      </span>
                      <span className="text-gray-300 font-mono tracking-widest text-xs">
                        &bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&rarr;
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                        <i className="fa-solid fa-location-dot text-rose-500 text-xs" />
                        <span>{ord.city}, {ord.state || 'India'}</span>
                      </span>
                    </div>

                    {/* Estimated Arrival & Status Badge */}
                    <div className="flex items-center sm:items-end justify-between sm:justify-center sm:flex-col gap-2 shrink-0 pt-1 sm:pt-0">
                      <span className="text-[10.5px] sm:text-[11px] text-gray-400 font-medium block">
                        Est: {ord.date}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${
                          statusBadgeStyle[ord.status]
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        <span>
                          {ord.status === 'Processing'
                            ? 'On Deliver'
                            : ord.status === 'Delivered'
                            ? 'Arrived'
                            : ord.status}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Items List Inside Order Card */}
                  <div className="flex flex-col gap-2.5 my-4 sm:my-5">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50/60 border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={item.image || '/images/miracle.jpeg'}
                            alt={item.productName}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border border-gray-200/80 bg-white shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate" title={item.productName}>
                              {item.productName}
                            </h4>
                            <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-800">₹{item.price.toLocaleString('en-IN')}</span>
                              <span>x{item.quantity}</span>
                              <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[9.5px] sm:text-[10px] font-semibold text-gray-600">
                                M / Consecrated
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-gray-900 block">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer: Total Amount + Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3.5 sm:pt-4 border-t border-gray-100 gap-3">
                    <div className="text-xs sm:text-sm text-gray-600 font-medium flex items-center justify-between sm:justify-start flex-wrap gap-1.5">
                      <div>
                        <span>Total: </span>
                        <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-gray-400 ml-1 text-xs">
                          ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-semibold bg-gray-100 text-gray-600 uppercase tracking-wide">
                        {ord.paymentMethod}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end w-full sm:w-auto">
                      {/* Status Selector Dropdown */}
                      <select
                        value={ord.status}
                        onChange={(e) => {
                          updateOrderStatus(ord.id, e.target.value as OrderStatus);
                          showToast(`Order ${ord.orderNumber} updated to ${e.target.value}`);
                        }}
                        className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border border-gray-200 bg-white cursor-pointer hover:border-gray-400 focus:outline-hidden text-gray-700 flex-1 sm:flex-initial min-w-[110px]"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing (On Deliver)</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered (Arrived)</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {/* Quick Confirm button for Pending */}
                      {ord.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            confirmOrder(ord.id);
                            showToast(`✓ Order ${ord.orderNumber} confirmed & ready to pack!`);
                          }}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                          title="Confirm this order"
                        >
                          <i className="fa-solid fa-check text-[10px]" />
                          <span>Confirm</span>
                        </button>
                      )}

                      {/* Wink Signature Jet-Black Pill Details Button */}
                      <button
                        type="button"
                        onClick={() => setViewingOrder(ord)}
                        style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
                        className="px-4 sm:px-6 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold bg-[#111111] hover:bg-black text-white rounded-full shadow-xs transition-all cursor-pointer whitespace-nowrap"
                      >
                        Details
                      </button>

                      {/* Delete / Remove */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete order ${ord.orderNumber}?`)) {
                            deleteOrder(ord.id);
                            showToast('Order removed.');
                          }
                        }}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                        title="Delete Order"
                      >
                        <i className="fa-solid fa-trash text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 my-8 sm:my-10 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
                  Order Breakdown
                </span>
                <h3 className="font-bold text-gray-900 text-lg">
                  {viewingOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <i className="fa-solid fa-xmark text-base" />
              </button>
            </div>

            {/* Customer Shipping Box */}
            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs">
              <span className="font-bold text-gray-700 block mb-1">
                Shipping &amp; Contact:
              </span>
              <p className="text-gray-800 font-semibold">{viewingOrder.customerName}</p>
              <p className="text-gray-600">{viewingOrder.address}</p>
              <p className="text-gray-600">
                {viewingOrder.city}, {viewingOrder.state} - {viewingOrder.pincode}
              </p>
              <p className="text-gray-600 mt-1">
                Phone: <span className="font-medium text-gray-900">{viewingOrder.phone}</span> • Email: {viewingOrder.email}
              </p>
            </div>

            {/* Item List */}
            <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
              <span className="text-xs font-bold text-gray-700">Ordered Items:</span>
              {viewingOrder.items.map((it, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-gray-100 bg-white"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={it.image}
                      alt={it.productName}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {it.productName}
                      </p>
                      <p className="text-[11px] text-gray-400">Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-900 shrink-0">
                    ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm">
              <span className="font-medium text-gray-500">Total Order Amount:</span>
              <span className="font-bold text-lg text-emerald-700">
                ₹{viewingOrder.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              {viewingOrder.status === 'Pending' ? (
                <button
                  type="button"
                  onClick={() => {
                    confirmOrder(viewingOrder.id);
                    setViewingOrder((prev) => (prev ? { ...prev, status: 'Processing' } : null));
                    showToast(`✓ Order ${viewingOrder.orderNumber} confirmed & ready to pack!`);
                  }}
                  style={{ backgroundColor: '#111111', color: '#ffffff' }}
                  className="px-5 py-2 text-xs font-semibold hover:bg-black text-white rounded-full shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-check text-xs" />
                  <span>Confirm Order</span>
                </button>
              ) : (
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    statusBadgeStyle[viewingOrder.status]
                  }`}
                >
                  Status: {viewingOrder.status}
                </span>
              )}

              <div className="flex items-center gap-2">
                <a
                  href={`/api/orders/${viewingOrder.orderNumber}/invoice`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors flex items-center gap-1.5 no-underline border border-gray-200"
                  title="Download PDF Invoice"
                >
                  <i className="fa-solid fa-file-pdf text-red-600" />
                  <span>Invoice PDF</span>
                </a>

                <button
                  type="button"
                  onClick={() => setViewingOrder(null)}
                  style={{ backgroundColor: '#111111', color: '#ffffff' }}
                  className="px-6 py-2 text-xs font-semibold hover:bg-black text-white rounded-full shadow-xs transition-colors cursor-pointer"
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
