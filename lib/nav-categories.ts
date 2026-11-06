import { revalidateTag, unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

export interface NavCategory {
  id: string;
  name: string;
}

const NAV_CATEGORIES_TAG = 'nav-categories';
const NAV_CATEGORY_LIMIT = 5;

const findLatestCategories = unstable_cache(
  (): Promise<NavCategory[]> =>
    prisma.category.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: NAV_CATEGORY_LIMIT,
      select: { id: true, name: true },
    }),
  [NAV_CATEGORIES_TAG],
  // The time limit only catches changes made outside the app, such as a seed script.
  { tags: [NAV_CATEGORIES_TAG], revalidate: 300 }
);

/** The newest categories, newest first. Empty if the database can't be reached, so the site still renders. */
export async function getNavCategories(): Promise<NavCategory[]> {
  try {
    return await findLatestCategories();
  } catch (error) {
    console.error('Failed to load navbar categories:', error);
    return [];
  }
}

/** Call from a route handler after any category is created, renamed or deleted. */
export function invalidateNavCategories() {
  revalidateTag(NAV_CATEGORIES_TAG, { expire: 0 });
}
