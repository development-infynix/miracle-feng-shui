import React from 'react';
import { productService } from '@/server/services/product.service';
import CategoriesClient from './CategoriesClient';

const PAGE_SIZE = 20;

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const requestedPage = Math.floor(Number(sp?.page));

  const data = await productService.getAdminCategories({
    q: sp?.q,
    page: requestedPage > 0 ? requestedPage : 1,
    pageSize: PAGE_SIZE,
  });

  return (
    <CategoriesClient
      categories={data.categories}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      search={sp?.q}
      stats={data.stats}
      categoryOptions={data.categoryOptions}
    />
  );
}
