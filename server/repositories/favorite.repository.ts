import prisma from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma/client';

export const favoriteRepository = {
  async findUserFavorites(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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
