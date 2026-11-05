import prisma from '@/lib/prisma';
import { Prisma, OrderStatus, PaymentMethod, PaymentStatus } from '@/app/generated/prisma/client';

export const orderRepository = {
  async create(
    data: {
      orderNumber: string;
      userId: string;
      status?: OrderStatus;
      paymentMethod: PaymentMethod;
      paymentStatus?: PaymentStatus;
      total: number;
      shippingAddress: any;
      razorpayOrderId?: string;
      items: {
        productId: string;
        title: string;
        price: number;
        quantity: number;
        image: string;
        selectedVariations?: any;
        personalizationText?: string;
      }[];
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        status: data.status || 'PENDING',
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus || 'PENDING',
        total: data.total,
        shippingAddress: data.shippingAddress,
        razorpayOrderId: data.razorpayOrderId,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            selectedVariations: item.selectedVariations,
            personalizationText: item.personalizationText,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  },

  async createOrderWithStockUpdate(
    data: {
      orderNumber: string;
      userId: string;
      status?: OrderStatus;
      paymentMethod: PaymentMethod;
      paymentStatus?: PaymentStatus;
      total: number;
      shippingAddress: any;
      razorpayOrderId?: string;
      items: {
        productId: string;
        title: string;
        price: number;
        quantity: number;
        image: string;
        selectedVariations?: any;
        personalizationText?: string;
      }[];
    },
    isCod: boolean
  ) {
    return prisma.$transaction(async (tx) => {
      const newOrder = await this.create(data, tx);

      if (isCod) {
        for (const item of data.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.cartItem.deleteMany({
          where: { cart: { userId: data.userId } },
        });
      }

      return newOrder;
    });
  },

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.order.findUnique({
      where: { id },
      include: {
        refunds: { orderBy: { createdAt: 'desc' } },
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
  },

  async findByOrderNumber(orderNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
  },

  async findByRazorpayOrderId(razorpayOrderId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.order.findFirst({
      where: { razorpayOrderId },
      include: {
        items: true,
      },
    });
  },

  async findUserOrders(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.order.findMany({
      where: { userId },
      include: {
        refunds: { orderBy: { createdAt: 'desc' } },
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findAll(
    filters?: { status?: OrderStatus; search?: string },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      const term = filters.search.trim();
      where.OR = [
        { orderNumber: { contains: term, mode: 'insensitive' } },
        { user: { name: { contains: term, mode: 'insensitive' } } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
      ];
    }

    return client.order.findMany({
      where,
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findByRazorpayPaymentId(razorpayPaymentId: string) {
    return prisma.order.findFirst({ where: { razorpayPaymentId } });
  },

  async updateStatus(id: string, status: OrderStatus, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  },

  async updatePayment(
    id: string,
    data: {
      status?: OrderStatus;
      paymentStatus: PaymentStatus;
      razorpayPaymentId?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.order.update({
      where: { id },
      data: {
        status: data.status,
        paymentStatus: data.paymentStatus,
        razorpayPaymentId: data.razorpayPaymentId,
      },
      include: { items: true },
    });
  },

  /**
   * Marks an order paid exactly once, so the browser and the webhook can both report the same payment.
   * Returns false if it was already paid, in which case nothing else changes.
   */
  async markOrderAsPaid(orderId: string, razorpayPaymentId: string) {
    return prisma.$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({
        // A repeated payment event mustn't undo a refund or take the stock a second time.
        where: { id: orderId, paymentStatus: { notIn: ['PAID', 'REFUNDED'] } },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID',
          razorpayPaymentId,
        },
      });
      if (count === 0) return false;

      const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true },
      });

      for (const item of order.items) {
        const { count: reduced } = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (reduced === 0) {
          // The money is already taken, so the order stands. The owner has to resolve the shortage.
          console.error(`[Orders] ${order.orderNumber} was paid for more of product ${item.productId} than is in stock.`);
          await tx.product.update({ where: { id: item.productId }, data: { stock: 0 } });
        }
      }

      // Only what was bought: a late payment shouldn't empty a cart the customer has since refilled.
      await tx.cartItem.deleteMany({
        where: {
          cart: { userId: order.userId },
          productId: { in: order.items.map((item) => item.productId) },
        },
      });

      return true;
    });
  },

  /**
   * Checked in the update itself, so a request can't slip in just after the order ships.
   * A customer gets one request per order. Returns false if nothing changed.
   */
  async requestCancellation(orderId: string, userId: string, reason: string) {
    const { count } = await prisma.order.updateMany({
      where: {
        id: orderId,
        userId,
        cancellationRequestedAt: null,
        OR: [
          { status: { in: ['PAID', 'COD_PENDING', 'PROCESSING'] } },
          { status: 'PENDING', paymentStatus: 'PAID' },
        ],
      },
      data: {
        status: 'CANCELLATION_REQUESTED',
        cancellationReason: reason,
        cancellationRequestedAt: new Date(),
      },
    });
    return count > 0;
  },

  /** Closes earlier online orders the customer never paid for, when they start paying again. */
  async cancelUnpaidOnlineOrders(userId: string) {
    return prisma.order.updateMany({
      where: {
        userId,
        paymentMethod: 'RAZORPAY',
        status: 'PENDING',
        paymentStatus: { not: 'PAID' },
      },
      data: { status: 'CANCELLED' },
    });
  },
};
