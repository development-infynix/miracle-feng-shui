import React from 'react';
import { adminService } from '@/server/services/admin.service';
import DashboardHeader from './_dashboard/DashboardHeader';
import DashboardScrollArea from './_dashboard/DashboardScrollArea';
import {
  ActionPanel,
  CatalogPanel,
  RecentOrdersPanel,
  SalesPanel,
  TopProductsPanel,
} from './_dashboard/DashboardSections';

// Orders and stock change all the time, so the dashboard is built fresh on every visit.
export const dynamic = 'force-dynamic';

/**
 * The owner's overview: what needs action now, how sales are going, what is selling,
 * and whether the catalog is ready. Every figure comes from the database.
 */
export default async function AdminDashboardPage() {
  const data = await adminService.getDashboard();
  const { catalog } = data;

  return (
    <DashboardScrollArea>
      <div style={{ fontFamily: "'Montserrat', sans-serif" }} className="flex flex-col gap-4 sm:gap-5 max-w-7xl mx-auto antialiased">
        <DashboardHeader
          productCount={catalog.activeProducts + catalog.pausedProducts + catalog.inactiveProducts}
          orderCount={data.totalOrders}
        />
        <ActionPanel action={data.action} />
        <SalesPanel sales={data.sales} periodDays={data.periodDays} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <TopProductsPanel products={data.topProducts} periodDays={data.periodDays} />
          <CatalogPanel catalog={catalog} />
        </div>
        <RecentOrdersPanel orders={data.recentOrders} />
      </div>
    </DashboardScrollArea>
  );
}
