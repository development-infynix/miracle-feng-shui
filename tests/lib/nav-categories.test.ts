import { beforeEach, describe, expect, it, vi } from 'vitest';

const findMany = vi.hoisted(() => vi.fn());
const revalidateTag = vi.hoisted(() => vi.fn());
const unstableCache = vi.hoisted(() =>
  vi.fn((fn: (...args: unknown[]) => unknown, _keys?: string[], _options?: unknown) => fn)
);

vi.mock('@/lib/prisma', () => ({ default: { category: { findMany } } }));
vi.mock('next/cache', () => ({ unstable_cache: unstableCache, revalidateTag }));

import { getNavCategories, invalidateNavCategories } from '@/lib/nav-categories';

describe('navbar categories', () => {
  const cacheOptions = unstableCache.mock.calls[0][2] as { tags: string[] };

  beforeEach(() => {
    findMany.mockReset();
    revalidateTag.mockReset();
  });

  it('asks for the 4 newest categories, newest first, with an image for each', async () => {
    findMany.mockResolvedValue([
      { id: 'c2', name: 'New', image: '/own.jpg', products: [{ images: ['/product.jpg'] }] },
      { id: 'c1', name: 'Old', image: null, products: [{ images: ['/newest-product.jpg'] }] },
      { id: 'c0', name: 'Empty', image: null, products: [] },
    ]);

    await expect(getNavCategories()).resolves.toEqual([
      { id: 'c2', name: 'New', image: '/own.jpg' },
      { id: 'c1', name: 'Old', image: '/newest-product.jpg' },
      { id: 'c0', name: 'Empty', image: '' },
    ]);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 4,
      })
    );
  });

  it('returns an empty list instead of failing when the database is down', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    findMany.mockRejectedValue(new Error('db down'));

    await expect(getNavCategories()).resolves.toEqual([]);

    logged.mockRestore();
  });

  it('invalidates the same tag the query is cached under, immediately', () => {
    invalidateNavCategories();

    expect(revalidateTag).toHaveBeenCalledWith(cacheOptions.tags[0], { expire: 0 });
  });
});
