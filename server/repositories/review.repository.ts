import prisma from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma/client';
import { CreateReviewInput } from '../validators/review.validator';

export const reviewRepository = {
  async findPageByProductId(productId: string, range: { skip: number; take: number }) {
    const where = { productId };
    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: range.skip,
        take: range.take,
      }),
      prisma.review.count({ where }),
    ]);
    return { items, total };
  },

  async findByUserAndProduct(
    userId: string,
    productId: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.review.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
  },

  async create(
    userId: string,
    productId: string,
    input: CreateReviewInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.review.create({
      data: {
        userId,
        productId,
        rating: input.rating,
        comment: input.comment,
        productVariation: input.productVariation,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  },
};
