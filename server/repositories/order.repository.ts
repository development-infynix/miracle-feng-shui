import prisma from '@/lib/prisma';
import { generateOrderAccessToken } from '../utils/orderReference';
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
      cancellationAllowed?: boolean;
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
    const status = data.status || 'PENDING';
    return client.order.create({
      data: {
        orderNumber: data.orderNumber,
        accessToken: generateOrderAccessToken(),
        userId: data.userId,
        status,
        // The customer placing the order is the first entry in its history.
        statusEvents: { create: { toStatus: status, actor: 'CUSTOMER', changedById: data.userId, note: 'Order placed' } },
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus || 'PENDING',
        total: data.total,
        shippingAddress: data.shippingAddress,
        razorpayOrderId: data.razorpayOrderId,
        cancellationAllowed: data.cancellationAllowed ?? true,
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
      cancellationAllowed?: boolean;
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
        // Only what was bought: paused products the order left out stay in the cart.
        await tx.cartItem.deleteMany({
          where: { cart: { userId: data.userId }, productId: { in: data.items.map((item) => item.productId) } },
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
        statusEvents: { select: { toStatus: true, createdAt: true, actor: true, note: true }, orderBy: { createdAt: 'asc' } },
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
        statusEvents: { select: { toStatus: true, createdAt: true, actor: true, note: true }, orderBy: { createdAt: 'asc' } },
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
        statusEvents: { select: { toStatus: true, createdAt: true, actor: true, note: true }, orderBy: { createdAt: 'asc' } },
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

  /**
   * Checked in the update itself, so a request can't slip in just after the order ships.
   * A customer gets one request per order. Returns false if nothing changed.
   */
  async requestCancellation(orderId: string, userId: string, reason: string) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
      if (!current) return false;
      const { count } = await tx.order.updateMany({
        where: {
          id: orderId,
          userId,
          // Also the status just read, so the history records exactly what it changed from.
          status: current.status,
          cancellationAllowed: true,
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
      if (count === 0) return false;
      await tx.orderStatusEvent.create({
        data: {
          orderId,
          fromStatus: current.status,
          toStatus: 'CANCELLATION_REQUESTED',
          actor: 'CUSTOMER',
          changedById: userId,
          note: reason,
        },
      });
      return true;
    });
  },

};
