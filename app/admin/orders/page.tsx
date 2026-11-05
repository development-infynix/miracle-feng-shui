import React from 'react';
import { adminService } from '@/server/services/admin.service';
import OrdersClient from './OrdersClient';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;

  const orders = await adminService.getOrders({
    search: sp?.q,
    status: sp?.status || 'all',
  } as any);

  return (
    <OrdersClient
      initialOrders={orders as any}
      search={sp?.q}
      status={sp?.status}
    />
  );
}
