import type { Metadata } from 'next';
import { productService } from '@/server/services/product.service';
import { productQuerySchema } from '@/server/validators/product.validator';
import HomeIntro from '@/home/components/HomeIntro';
import NewArrivals from '@/home/components/NewArrivals';
import LatestCategories from '@/home/components/LatestCategories';
import HomeBento from '@/home/components/HomeBento';

export const metadata: Metadata = {
  title: 'Miracle feng shui | Feng shui decor, jewelry, candles, crystals and books',
  description: 'Shop feng shui decor, jewelry, candles, crystals and books for every corner of your home.',
};

const NEW_ARRIVALS = 8;

export default async function HomePage() {
  const [newArrivals, categories, bestsellers] = await Promise.all([
    productService.list(productQuerySchema.parse({ sort: 'newest', pageSize: NEW_ARRIVALS })),
    productService.listLatestCategories(4),
    productService.listBestsellers(4),
  ]);

  return (
    <div className="pb-8">
      <HomeIntro />
      <div className="flex flex-col gap-16 sm:gap-24">
        <NewArrivals products={newArrivals.items} />
        <LatestCategories categories={categories} />
        <HomeBento bestsellers={bestsellers} />
      </div>
    </div>
  );
}
