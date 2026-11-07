import { productService } from '@/server/services/product.service';
import HomeHero from '@/home/components/HomeHero';
import LatestCategories from '@/home/components/LatestCategories';
import NewArrivals from '@/home/components/NewArrivals';
import AccountShortcuts from '@/home/components/AccountShortcuts';

const NEW_ARRIVALS = 8;

/**
 * The homepage: the hero, the 4 newest categories, the 8 newest products (4 on phones),
 * then, for signed-in customers, their favorites, cart and latest order.
 */
export default async function HomePage() {
  const [categories, newArrivals] = await Promise.all([
    productService.listLatestCategories(4),
    productService.listNewest(NEW_ARRIVALS),
  ]);

  return (
    <div className="pb-12">
      <HomeHero />
      <LatestCategories categories={categories} />
      <NewArrivals products={newArrivals} />
      <AccountShortcuts />
    </div>
  );
}
