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

  async markOrderAsPaid(orderId: string, razorpayPaymentId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID',
          razorpayPaymentId,
        },
        include: { items: true },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cart: { userId: order.userId } },
      });

      return order;
    });
  },
};
