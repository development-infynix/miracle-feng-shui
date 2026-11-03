import React from 'react';
import { adminService } from '@/server/services/admin.service';
import prisma from '@/lib/prisma';
import ProductsClient from './ProductsClient';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp?.page) || 1;
  const pageSize = 20;

  const data = await adminService.getProducts({
    page,
    pageSize,
    q: sp?.q,
    category: sp?.category,
    status: 'all',
  } as any);

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
      page={data.page}
      pageSize={data.pageSize}
      totalPages={data.totalPages}
      categories={categories}
    />
  );
}