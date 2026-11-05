import prisma from '@/lib/prisma';
import { productReviewCount } from './product.repository';
import { Prisma } from '@/app/generated/prisma/client';

export const favoriteRepository = {
  async findUserFavorites(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true, ...productReviewCount },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /** One page of favorites. Hidden products are left out, because they can't be opened. */
  async findUserFavoritesPage(userId: string, range: { skip: number; take: number }) {
    const where = { userId, product: { isActive: true } };
    const [items, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        include: { product: { include: { category: true } } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: range.skip,
        take: range.take,
      }),
      prisma.favorite.count({ where }),
    ]);
    return { items, total };
  },

  async findByUserAndProduct(
    userId: string,
    productId: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
  },

  async create(userId: string, productId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.favorite.create({
      data: { userId, productId },
      include: { product: true },
    });
  },

  async delete(userId: string, productId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.favorite.deleteMany({
      where: { userId, productId },
    });
  },
};
