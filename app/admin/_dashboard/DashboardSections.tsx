import React from 'react';
import Link from 'next/link';
import type { DashboardData } from '@/server/services/admin.service';

const rupees = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const ordersLink = (status: string) => `/admin/orders?status=${status}`;
const productLink = (title: string) => `/admin/products?q=${encodeURIComponent(title)}`;

const card = 'bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/70 shadow-2xs';
const cardTitle = 'text-sm sm:text-base font-bold text-gray-900 tracking-tight';

const STATUS_STYLE: Record<string, string> = {
  Pending: 'bg-[#FFF7ED] text-[#C2410C]',
  Processing: 'bg-[#EBF2FE] text-[#1D4ED8]',
  Shipped: 'bg-[#F3EEFC] text-[#6D28D9]',
  Delivered: 'bg-[#E6F4F1] text-[#0F766E]',
  'Cancellation Requested': 'bg-[#FEE2E2] text-[#B91C1C]',
  'Cancellation Approved': 'bg-[#FEE2E2] text-[#B91C1C]',
  Cancelled: 'bg-[#FEE2E2] text-[#B91C1C]',
};

/** What needs doing now. Each task opens the orders page filtered to it. */
export function ActionPanel({ action }: { action: DashboardData['action'] }) {
  const tasks = [
    { count: action.toConfirm, label: 'to confirm', hint: 'COD orders waiting for your confirmation', href: ordersLink('PENDING'), icon: 'fa-circle-check' },
    { count: action.toPack, label: 'to pack and ship', hint: 'Paid or confirmed, not shipped yet', href: ordersLink('PROCESSING'), icon: 'fa-box' },
    { count: action.cancellationRequests, label: 'cancellation requests', hint: 'Customers asking to cancel', href: ordersLink('CANCELLATION_REQUESTED'), icon: 'fa-ban' },
    { count: action.refundsDue, label: 'refunds to send', hint: 'Cancelled after payment, money not returned yet', href: ordersLink('CANCELLATION_APPROVED'), icon: 'fa-rotate-left' },
    { count: action.refundsFailed, label: 'failed refunds', hint: 'Razorpay refused the refund, try again', href: ordersLink('CANCELLATION_APPROVED'), icon: 'fa-triangle-exclamation', urgent: true },
  ];
  const open = tasks.filter((t) => t.count > 0);

  return (
    <section aria-labelledby="dash-action" className={card}>
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
        <h2 id="dash-action" className={cardTitle}>Needs your action</h2>
        {action.inTransit > 0 && (
          <Link href={ordersLink('SHIPPED')} className="text-[11px] font-semibold text-gray-600 hover:text-black no-underline">
            {plural(action.inTransit, 'order')} on the way &rarr;
          </Link>
        )}
      </div>

      {open.length === 0 ? (
        <div className="flex items-center gap-3 py-2">
          <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center text-sm shrink-0">
            <i className="fa-solid fa-check" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">All caught up</p>
            <p className="text-xs text-gray-500">No orders, cancellations or refunds are waiting on you.</p>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 list-none p-0 m-0">
          {open.map((t) => (
            <li key={t.label}>
              <Link
                href={t.href}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors no-underline ${
                  t.urgent ? 'border-red-200 bg-red-50/60 hover:bg-red-50' : 'border-gray-200/70 bg-gray-50/60 hover:bg-gray-100'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${t.urgent ? 'bg-red-100 text-red-700' : 'bg-white text-gray-700 border border-gray-200'}`}>
                  <i className={`fa-solid ${t.icon}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    <span className="tabular-nums">{t.count}</span> {t.label}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{t.hint}</p>
                </div>
                <i className="fa-solid fa-arrow-right text-[10px] text-gray-400" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Sales over the last period, compared with the one before. Cancelled orders don't count. */
export function SalesPanel({ sales, periodDays }: { sales: DashboardData['sales']; periodDays: number }) {
  const change = sales.revenueChange;
  const changeText =
    change === null ? `No sales in the ${periodDays} days before to compare` : `${change >= 0 ? '+' : ''}${Math.round(change * 100)}% vs the ${periodDays} days before`;
  const changeStyle = change === null ? 'text-gray-500' : change >= 0 ? 'text-[#0F766E]' : 'text-[#B91C1C]';

  const stats = [
    { label: 'Orders', value: String(sales.orders), note: `${sales.previousOrders} the ${periodDays} days before` },
    { label: 'Average order', value: rupees(sales.averageOrder), note: 'Per order' },
    {
      label: 'COD to collect',
      value: rupees(sales.codDue),
      note: sales.codDueOrders > 0 ? `From ${plural(sales.codDueOrders, 'order')} not yet delivered` : 'Nothing outstanding',
    },
  ];

  return (
    <section aria-labelledby="dash-sales" className={card}>
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
        <h2 id="dash-sales" className={cardTitle}>Sales, last {periodDays} days</h2>
        <Link href="/admin/orders" className="text-[11px] font-semibold text-gray-600 hover:text-black no-underline">All orders &rarr;</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-2 lg:col-span-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Revenue</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight tabular-nums mt-1">{rupees(sales.revenue)}</p>
          <p className={`text-[11px] font-semibold mt-0.5 ${changeStyle}`}>{changeText}</p>
        </div>
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight tabular-nums mt-1">{s.value}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{s.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Best sellers by units sold in the period. */
export function TopProductsPanel({ products, periodDays }: { products: DashboardData['topProducts']; periodDays: number }) {
  return (
    <section aria-labelledby="dash-top" className={`${card} flex flex-col`}>
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
        <h2 id="dash-top" className={cardTitle}>Selling best</h2>
        <span className="text-[11px] text-gray-500">Last {periodDays} days</span>
      </div>
      {products.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">No sales in the last {periodDays} days yet.</p>
      ) : (
        <ol className="flex flex-col gap-1 list-none p-0 m-0">
          {products.map((p, i) => (
            <li key={p.productId}>
              <Link href={productLink(p.title)} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition-colors no-underline">
                <span className="w-4 text-[11px] font-bold text-gray-400 tabular-nums text-right shrink-0">{i + 1}</span>
                {p.image ? (
                  <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0" />
                )}
                <span className="min-w-0 flex-1 text-xs font-semibold text-gray-900 truncate">{p.title}</span>
                <span className="text-right shrink-0">
                  <span className="block text-xs font-bold text-gray-900 tabular-nums">{plural(p.units, 'sold')}</span>
                  <span className="block text-[10px] text-gray-500 tabular-nums">{rupees(p.revenue)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** Whether the catalog is ready to sell: what's live, paused or archived, and what's running out. */
export function CatalogPanel({ catalog }: { catalog: DashboardData['catalog'] }) {
  const counts = [
    { label: 'Live', value: catalog.activeProducts, style: 'text-gray-900' },
    { label: 'Paused', value: catalog.pausedProducts, style: catalog.pausedProducts > 0 ? 'text-[#B45309]' : 'text-gray-900' },
    { label: 'Archived', value: catalog.inactiveProducts, style: 'text-gray-900' },
    { label: 'Out of stock', value: catalog.outOfStock, style: catalog.outOfStock > 0 ? 'text-[#B91C1C]' : 'text-gray-900' },
  ];

  return (
    <section aria-labelledby="dash-catalog" className={`${card} flex flex-col`}>
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
        <h2 id="dash-catalog" className={cardTitle}>Catalog</h2>
        <Link href="/admin/products" className="text-[11px] font-semibold text-gray-600 hover:text-black no-underline">Products &rarr;</Link>
      </div>
      <dl className="grid grid-cols-4 gap-2 m-0">
        {counts.map((c) => (
          <div key={c.label} className="rounded-xl bg-gray-50/70 border border-gray-200/60 px-2 py-2 text-center">
            <dt className="text-[10px] font-semibold text-gray-500">{c.label}</dt>
            <dd className={`m-0 text-lg font-bold tabular-nums ${c.style}`}>{c.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <p className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Running low <span className="font-normal normal-case tracking-normal text-gray-500">(under {catalog.lowStockThreshold} in stock)</span>
        </p>
        {catalog.alerts.length === 0 ? (
          <p className="text-xs text-gray-500">Every live product has {catalog.lowStockThreshold} or more in stock.</p>
        ) : (
          <ul className="flex flex-col gap-1 list-none p-0 m-0">
            {catalog.alerts.map((p) => (
              <li key={p.id}>
                <Link href={productLink(p.title)} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-50 transition-colors no-underline">
                  {p.image ? (
                    <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-gray-100" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                  )}
                  <span className="min-w-0 flex-1 text-xs font-semibold text-gray-900 truncate">{p.title}</span>
                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md shrink-0 tabular-nums ${
                      p.stock === 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {p.stock === 0 ? 'Out' : `${p.stock} left`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {catalog.lowStock + catalog.outOfStock > catalog.alerts.length && (
          <p className="text-[11px] text-gray-500 mt-1.5">
            And {catalog.lowStock + catalog.outOfStock - catalog.alerts.length} more in the products list.
          </p>
        )}
      </div>
    </section>
  );
}

/** The latest orders, read only. Status changes, refunds and cancellations happen on the orders page. */
export function RecentOrdersPanel({ orders }: { orders: DashboardData['recentOrders'] }) {
  return (
    <section aria-labelledby="dash-recent" className={card}>
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
        <h2 id="dash-recent" className={cardTitle}>Latest orders</h2>
        <Link href="/admin/orders" className="text-[11px] font-semibold text-gray-600 hover:text-black no-underline">All orders &rarr;</Link>
      </div>
      {orders.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 text-[10px] uppercase tracking-wider font-semibold">
              <tr>
                <th scope="col" className="py-2 px-2.5 rounded-l-lg">Order</th>
                <th scope="col" className="py-2 px-2.5">Customer</th>
                <th scope="col" className="py-2 px-2.5">Placed</th>
                <th scope="col" className="py-2 px-2.5 text-right">Total</th>
                <th scope="col" className="py-2 px-2.5 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-2.5 px-2.5">
                    <Link href={`/admin/orders?q=${encodeURIComponent(o.orderNumber)}`} className="font-semibold text-gray-900 font-mono text-[11px] hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="py-2.5 px-2.5">
                    <div className="font-semibold text-gray-900">{o.customerName}</div>
                    <div className="text-[10px] text-gray-500">
                      {plural(o.items, 'item')} &bull; {o.paymentMethod}
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-gray-600 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZone: 'Asia/Kolkata',
                    })}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-bold text-gray-900 tabular-nums">{rupees(o.total)}</td>
                  <td className="py-2.5 px-2.5">
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLE[o.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
