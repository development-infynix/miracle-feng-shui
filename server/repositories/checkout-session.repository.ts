import prisma from '@/lib/prisma';
import { generateOrderAccessToken, generateOrderNumber } from '../utils/orderReference';
import { Prisma } from '@/app/generated/prisma/client';

// A late payment can still arrive for a while after the customer opens the payment window.
const KEEP_SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export interface CheckoutItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  selectedVariations?: any;
  personalizationText?: string;
}

/** What a customer is paying for. It only becomes an order once the payment is confirmed. */
export const checkoutSessionRepository = {
  async create(data: {
    razorpayOrderId: string;
    orderNumber: string;
    userId: string;
    total: number;
    shippingAddress: any;
    items: CheckoutItem[];
    cancellationAllowed: boolean;
  }) {
    return prisma.checkoutSession.create({
      data: { ...data, items: data.items as unknown as Prisma.InputJsonValue },
    });
  },

  async deleteExpired() {
    return prisma.checkoutSession.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - KEEP_SESSION_MS) } },
    });
  },

  /** A fresh order number no order or open checkout already has. Collisions are very unlikely; this rules them out. */
  async newOrderNumber() {
    for (let attempt = 0; attempt < 5; attempt++) {
      const orderNumber = generateOrderNumber();
      if (!(await this.orderNumberTaken(orderNumber))) return orderNumber;
    }
    throw new Error('Could not find a free order number');
  },

  async orderNumberTaken(orderNumber: string) {
    const [order, session] = await Promise.all([
      prisma.order.findUnique({ where: { orderNumber }, select: { id: true } }),
      prisma.checkoutSession.findUnique({ where: { orderNumber }, select: { id: true } }),
    ]);
    return Boolean(order || session);
  },

  /** Who is paying for this Razorpay order, whether or not the order has been written yet. */
  async findOwner(razorpayOrderId: string) {
    const [order, session] = await Promise.all([
      prisma.order.findUnique({ where: { razorpayOrderId }, select: { userId: true } }),
      prisma.checkoutSession.findUnique({ where: { razorpayOrderId }, select: { userId: true } }),
    ]);
    return order?.userId ?? session?.userId ?? null;
  },

  /** The amount a Razorpay order is expected to have captured — from the open checkout session, or the paid order if the session has already completed. */
  async findSession(razorpayOrderId: string) {
    const session = await prisma.checkoutSession.findUnique({
      where: { razorpayOrderId },
      select: { razorpayOrderId: true, total: true },
    });
    if (session) return session;

    const order = await prisma.order.findUnique({
      where: { razorpayOrderId },
      select: { total: true },
    });
    if (!order) return null;
    return { razorpayOrderId, total: order.total };
  },

  /**
   * Writes the paid order, exactly once, so the browser and the webhook can both report the
   * same payment. Returns null if the store has no record of this Razorpay order.
   */
  async completePayment(razorpayOrderId: string, razorpayPaymentId: string) {
    const existing = await prisma.order.findUnique({ where: { razorpayOrderId }, select: { id: true } });
    if (existing) return { orderId: existing.id, created: false };

    try {
      return await prisma.$transaction(async (tx) => {
        const session = await tx.checkoutSession.findUnique({ where: { razorpayOrderId } });
        if (!session) return null;

        const items = session.items as unknown as CheckoutItem[];
        const order = await tx.order.create({
          data: {
            orderNumber: session.orderNumber,
            accessToken: generateOrderAccessToken(),
            userId: session.userId,
            status: 'PAID',
            paymentMethod: 'RAZORPAY',
            paymentStatus: 'PAID',
            total: session.total,
            shippingAddress: session.shippingAddress as Prisma.InputJsonValue,
            razorpayOrderId,
            razorpayPaymentId,
            cancellationAllowed: session.cancellationAllowed,
            // The order's history starts with the payment that created it.
            statusEvents: { create: { toStatus: 'PAID', actor: 'SYSTEM', note: 'Payment confirmed' } },
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                selectedVariations: item.selectedVariations ?? undefined,
                personalizationText: item.personalizationText,
              })),
            },
          },
        });

        for (const item of items) {
          const { count } = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (count === 0) {
            // The money is already taken, so the order stands. The owner has to resolve the shortage.
            console.error(`[Orders] ${session.orderNumber} was paid for more of product ${item.productId} than is in stock.`);
            await tx.product.update({ where: { id: item.productId }, data: { stock: 0 } });
          }
        }

        // Only what was bought: a late payment shouldn't empty a cart the customer has since refilled.
        await tx.cartItem.deleteMany({
          where: {
            cart: { userId: session.userId },
            productId: { in: items.map((item) => item.productId) },
          },
        });

        await tx.checkoutSession.delete({ where: { id: session.id } });
        return { orderId: order.id, created: true };
      });
    } catch (error) {
      // The browser and the webhook arrived together, and the other one wrote the order.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const written = await prisma.order.findUnique({ where: { razorpayOrderId }, select: { id: true } });
        if (written) return { orderId: written.id, created: false };
      }
      throw error;
    }
  },
};
