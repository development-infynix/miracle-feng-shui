import type { Metadata } from 'next';
import { productService } from '@/server/services/product.service';
import { productQuerySchema } from '@/server/validators/product.validator';
import ShopView from '@/shop/components/ShopView';
import { parseShopFilters, toProductQuery, type ShopCategory } from '@/shop/components/shopFilters';

export const metadata: Metadata = {
  title: 'Shop | Miracle feng shui',
  description: 'Browse feng shui decor, jewelry, candles, crystals and books.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseShopFilters(params);

  const [{ items, total }, categories] = await Promise.all([
    productService.list(productQuerySchema.parse(toProductQuery(filters, 1))),
    productService.listCategories(),
  ]);

  const shopCategories: ShopCategory[] = categories.map((category: { id?: string; name: string; productCount?: number }) => ({
    id: category.id ?? category.name,
    name: category.name,
    productCount: category.productCount ?? 0,
  }));

  return <ShopView filters={filters} categories={shopCategories} products={items} total={total} browseCategories={params.browse === 'categories'} />;
}
