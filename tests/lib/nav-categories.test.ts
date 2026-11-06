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

  it('asks for the 5 newest categories, newest first', async () => {
    const rows = [{ id: 'c2', name: 'New' }, { id: 'c1', name: 'Old' }];
    findMany.mockResolvedValue(rows);

    await expect(getNavCategories()).resolves.toEqual(rows);

    expect(findMany).toHaveBeenCalledWith({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 5,
      select: { id: true, name: true },
    });
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
