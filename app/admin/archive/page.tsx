import React from 'react';
import { adminService } from '@/server/services/admin.service';
import { reviewService } from '@/server/services/review.service';
import { adminReviewQuerySchema } from '@/server/validators/review.validator';
import ArchiveClient, { type ArchivedProduct, type ArchiveTab } from './ArchiveClient';
import type { OrderItemData } from '../orders/types';
import type { AdminReviewPage } from '../reviews/types';

export const metadata = { title: 'Archive | Admin' };

const TABS: ArchiveTab[] = ['orders', 'products', 'reviews'];

// Archived orders and products, and hidden reviews: out of the day-to-day lists and the store,
// kept for their history, restorable. Archived products can be deleted for good after two weeks.
export default async function AdminArchivePage({ searchParams }: { searchParams: Promise<{ tab?: string; page?: string }> }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t === sp?.tab) ?? 'orders';
  const [orders, products, reviews] = await Promise.all([
    adminService.getOrders({ archived: true }),
    adminService.getProducts({ page: 1, pageSize: 100, status: 'inactive' }),
    reviewService.listForAdmin(adminReviewQuerySchema.parse({ page: tab === 'reviews' ? sp?.page || undefined : undefined }), true),
  ]);

  return (
    <ArchiveClient
      tab={tab}
      orders={orders as OrderItemData[]}
      products={products.products as ArchivedProduct[]}
      productTotal={products.total}
      reviewPage={reviews as AdminReviewPage}
    />
  );
}
