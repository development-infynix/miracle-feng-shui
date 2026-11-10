import React from 'react';
import { adminService } from '@/server/services/admin.service';
import ArchiveClient, { type ArchivedProduct } from './ArchiveClient';
import type { OrderItemData } from '../orders/types';

export const metadata = { title: 'Archive | Admin' };

// Archived orders and products: hidden from the day-to-day lists, kept for their history, restorable.
// Nothing here is ever deleted.
export default async function AdminArchivePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams;
  const [orders, products] = await Promise.all([
    adminService.getOrders({ archived: true }),
    adminService.getProducts({ page: 1, pageSize: 100, status: 'inactive' }),
  ]);

  return (
    <ArchiveClient
      tab={sp?.tab === 'products' ? 'products' : 'orders'}
      orders={orders as OrderItemData[]}
      products={products.products as ArchivedProduct[]}
      productTotal={products.total}
    />
  );
}
