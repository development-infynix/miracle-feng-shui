import prisma from '@/lib/prisma';
import { Prisma, type OrderStatus } from '@/app/generated/prisma/client';

export type RazorpayRefundState = 'pending' | 'processed' | 'failed';

export const refundRepository = {
  /**
   * Checked in the update itself, so two taps can't create two requests.
   * A customer asks once their cancellation is approved; an admin refunds an order they cancelled
   * themselves (`userId` null). Returns false if this order can't get a refund that way.
   */
  async createRequest(
    orderId: string,
    userId: string | null,
    amountPaise: number,
    statuses: readonly OrderStatus[] = ['CANCELLATION_APPROVED']
  ) {
    return prisma.$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({
        where: {
          id: orderId,
          ...(userId && { userId }),
          refundRequestedAt: null,
          status: { in: [...statuses] },
          paymentStatus: 'PAID',
          paymentMethod: 'RAZORPAY',
          razorpayPaymentId: { not: null },
          refunds: { none: {} },
        },
        data: { refundRequestedAt: new Date() },
      });
      if (count === 0) return false;

      await tx.refund.create({ data: { orderId, amountPaise } });
      return true;
    });
  },

  async findOpenForOrder(orderId: string) {
    return prisma.refund.findFirst({
      where: { orderId, status: { in: ['REQUESTED', 'FAILED'] } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findProcessingForOrder(orderId: string) {
    return prisma.refund.findFirst({
      where: { orderId, status: 'PROCESSING' },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findLatestForOrder(orderId: string) {
    return prisma.refund.findFirst({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  },

  async findById(id: string) {
    return prisma.refund.findUnique({ where: { id } });
  },

  async findByRazorpayId(razorpayRefundId: string) {
    return prisma.refund.findUnique({ where: { razorpayRefundId } });
  },

  /** Only one approval can win, so a double click can't send two refunds to Razorpay. */
  async claimForApproval(id: string, approvedById: string) {
    const { count } = await prisma.refund.updateMany({
      where: { id, status: { in: ['REQUESTED', 'FAILED'] } },
      data: {
        status: 'PROCESSING',
        approvedById,
        approvedAt: new Date(),
        razorpayRefundId: null,
        failureReason: null,
      },
    });
    return count > 0;
  },

  async markFailed(id: string, failureReason: string) {
    await prisma.refund.updateMany({
      where: { id, status: 'PROCESSING' },
      data: { status: 'FAILED', failureReason },
    });
  },

  /** A refund made in the Razorpay dashboard, which the store learns about from its webhook. */
  async createFromRazorpay(orderId: string, razorpayRefundId: string, amountPaise: number) {
    try {
      return await prisma.$transaction(async (tx) => {
        await tx.order.updateMany({
          where: { id: orderId, refundRequestedAt: null },
          data: { refundRequestedAt: new Date() },
        });
        return tx.refund.create({
          data: { orderId, razorpayRefundId, amountPaise, status: 'PROCESSING' },
        });
      });
    } catch (error) {
      // Another delivery of the same event got here first.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return prisma.refund.findUnique({ where: { razorpayRefundId } });
      }
      throw error;
    }
  },

  /**
   * Records what Razorpay says about a refund. Events can repeat or arrive out of order, so a
   * finished refund never moves backwards. Stock and the payment status only change once
   * the money has really gone back.
   * Returns who to tell when this call is the one that marks the refund processed, otherwise null.
   */
  async applyRazorpayState(
    id: string,
    state: RazorpayRefundState,
    razorpayRefundId: string,
    failureReason?: string
  ) {
    return prisma.$transaction(async (tx) => {
      if (state === 'pending') {
        await tx.refund.updateMany({
          where: { id, status: 'PROCESSING' },
          data: { razorpayRefundId },
        });
        return null;
      }

      if (state === 'failed') {
        await tx.refund.updateMany({
          where: { id, status: { not: 'PROCESSED' } },
          data: {
            status: 'FAILED',
            razorpayRefundId,
            failureReason: failureReason || 'Razorpay could not complete this refund.',
          },
        });
        return null;
      }

      const { count } = await tx.refund.updateMany({
        where: { id, status: { not: 'PROCESSED' } },
        data: { status: 'PROCESSED', razorpayRefundId, failureReason: null },
      });
      if (count === 0) return null;

      const refund = await tx.refund.findUniqueOrThrow({
        where: { id },
        include: { order: { include: { items: true, refunds: true } } },
      });

      // A refund made in the Razorpay dashboard can be partial, so only an approved refund returns stock.
      const { count: returning } = await tx.refund.updateMany({
        where: { id, stockReturned: false, approvedAt: { not: null } },
        data: { stockReturned: true },
      });
      if (returning > 0) {
        for (const item of refund.order.items) {
          // A product deleted for good has nowhere to return stock to.
          if (!item.productId) continue;
          await tx.product.updateMany({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      const refundedPaise = refund.order.refunds
        .filter((row) => row.status === 'PROCESSED')
        .reduce((sum, row) => sum + row.amountPaise, 0);
      if (refundedPaise >= Math.round(refund.order.total * 100)) {
        await tx.order.update({ where: { id: refund.orderId }, data: { paymentStatus: 'REFUNDED' } });
      }
      return { userId: refund.order.userId, orderNumber: refund.order.orderNumber, amountPaise: refund.amountPaise };
    });
  },
};
