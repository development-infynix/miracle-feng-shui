import React from 'react';
import { adminService } from '@/server/services/admin.service';
import prisma from '@/lib/prisma';
import ProductsClient from './ProductsClient';
import { adminProductQuerySchema } from '@/server/validators/admin.validator';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp?.page) || 1;
  const pageSize = 20;
  // An unknown status in the URL just shows everything.
  const tag = adminProductQuerySchema.shape.tag.safeParse(sp?.tag || undefined).data;

  const data = await adminService.getProducts({
    page,
    pageSize,
    q: sp?.q,
    category: sp?.category,
    tag,
    // Archived products live on the Archive page.
    status: 'active',
  } as any);

  const stockStats = await adminService.getProductStockStats();

  const cats = await prisma.category.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  });
  const categories = ['All', ...cats.map((c) => c.name)];

  return (
    <ProductsClient
      initialProducts={data.products as any}
      total={data.total}
      search={sp?.q}
      category={sp?.category}
      tag={tag}
      page={data.page}
      pageSize={data.pageSize}
      totalPages={data.totalPages}
      categories={categories}
      stockStats={stockStats}
    />
  );
}