import prisma from '@/lib/prisma';
import { Prisma, ReviewHideReason } from '@/app/generated/prisma/client';
import { CreateReviewInput } from '../validators/review.validator';

export interface AdminReviewFilters {
  hidden: boolean;
  /** 1 to 5 for that many stars, or 'low' for 1 and 2. */
  rating?: number | 'low';
  /** Only reviews the store hasn't replied to. */
  unanswered?: boolean;
  productId?: string;
  /** Matches the product title, the customer's name or email, or the review text. */
  q?: string;
  skip: number;
  take: number;
}

export const reviewRepository = {
  /** The store's view: shown reviews only. */
  async findPageByProductId(productId: string, range: { skip: number; take: number }) {
    const where = { productId, hiddenAt: null };
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

  /** Whether this customer has had this product delivered, from an order that's still Delivered. */
  async hasDelivery(userId: string, productId: string) {
    const count = await prisma.orderItem.count({
      where: { productId, order: { userId, status: 'DELIVERED', deliveredAt: { not: null } } },
    });
    return count > 0;
  },

  /** Deliveries for many (customer, product) pairs at once, for the admin list's Verified Purchase badges. */
  async findDeliveriesFor(pairs: { userId: string; productId: string }[]) {
    if (pairs.length === 0) return [];
    const items = await prisma.orderItem.findMany({
      where: {
        productId: { in: [...new Set(pairs.map((p) => p.productId))] },
        order: { userId: { in: [...new Set(pairs.map((p) => p.userId))] }, status: 'DELIVERED', deliveredAt: { not: null } },
      },
      select: { productId: true, order: { select: { userId: true, deliveredAt: true } } },
    });
    return items.map((item) => ({ productId: item.productId, userId: item.order.userId, deliveredAt: item.order.deliveredAt as Date }));
  },

  /** When each of these customers had this product delivered, from orders that are still Delivered. */
  async findDeliveries(productId: string, userIds: string[]) {
    if (userIds.length === 0) return [];
    const items = await prisma.orderItem.findMany({
      where: {
        productId,
        order: { userId: { in: userIds }, status: 'DELIVERED', deliveredAt: { not: null } },
      },
      select: { order: { select: { userId: true, deliveredAt: true } } },
    });
    return items.map(({ order }) => ({ userId: order.userId, deliveredAt: order.deliveredAt as Date }));
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

  // Admin. Results go to the browser, so user fields are allowlisted.
  async findForAdmin(filters: AdminReviewFilters) {
    const where: Prisma.ReviewWhereInput = { hiddenAt: filters.hidden ? { not: null } : null };
    if (filters.rating === 'low') where.rating = { lte: 2 };
    else if (filters.rating) where.rating = filters.rating;
    if (filters.unanswered) where.reply = null;
    if (filters.productId) where.productId = filters.productId;
    const term = filters.q?.trim();
    if (term) {
      where.OR = [
        { comment: { contains: term, mode: 'insensitive' } },
        { product: { title: { contains: term, mode: 'insensitive' } } },
        { user: { name: { contains: term, mode: 'insensitive' } } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, title: true, slug: true, images: true } },
          events: {
            where: { action: 'HIDDEN' },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { changedBy: { select: { name: true, email: true } } },
          },
        },
        orderBy: filters.hidden ? [{ hiddenAt: 'desc' }, { id: 'desc' }] : [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: filters.skip,
        take: filters.take,
      }),
      prisma.review.count({ where }),
    ]);
    return { items, total };
  },

  async countHidden() {
    return prisma.review.count({ where: { hiddenAt: { not: null } } });
  },

  /**
   * Hides or restores a review and records it, in one step. Only matches a review in the other state,
   * so two admins acting at once can't both succeed. Returns false when nothing matched.
   */
  async setHidden(
    id: string,
    hide: { reason: ReviewHideReason; note: string | null } | null,
    adminId: string | null
  ) {
    return prisma.$transaction(async (tx) => {
      const { count } = await tx.review.updateMany({
        where: hide ? { id, hiddenAt: null } : { id, hiddenAt: { not: null } },
        data: hide
          ? { hiddenAt: new Date(), hiddenReason: hide.reason, hiddenNote: hide.note }
          : { hiddenAt: null, hiddenReason: null, hiddenNote: null },
      });
      if (count === 0) return false;
      await tx.reviewEvent.create({
        data: hide
          ? { reviewId: id, action: 'HIDDEN', reason: hide.reason, note: hide.note, changedById: adminId }
          : { reviewId: id, action: 'RESTORED', changedById: adminId },
      });
      return true;
    });
  },

  /** Sets the store's reply (or removes it with null) and records it, in one step. */
  async setReply(id: string, reply: string | null, adminId: string | null) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id },
        data: { reply, repliedAt: reply ? new Date() : null },
        select: { id: true, reply: true, repliedAt: true },
      });
      await tx.reviewEvent.create({
        data: { reviewId: id, action: reply ? 'REPLIED' : 'REPLY_REMOVED', note: reply, changedById: adminId },
      });
      return review;
    });
  },

  async findById(id: string) {
    return prisma.review.findUnique({ where: { id }, select: { id: true, hiddenAt: true, reply: true } });
  },
};
