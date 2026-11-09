import prisma from '@/lib/prisma';
import { productReviewCount } from './product.repository';
import { Prisma, OrderStatus } from '@/app/generated/prisma/client';
import {
  AdminProductQueryInput,
  CreateProductInput,
  UpdateProductInput,
} from '../validators/admin.validator';
import { ApiError } from '../utils/ApiError';

/** Accepts a category id or exact name. Products can only join a category that already exists. */
async function resolveCategoryId(identifier: string) {
  const category = await prisma.category.findFirst({
    where: { OR: [{ id: identifier }, { name: identifier }] },
    select: { id: true },
  });
  if (!category) {
    throw ApiError.badRequest(`Category "${identifier}" does not exist.`);
  }
  return category.id;
}

const CUSTOMER_PRODUCT_SELECT = {
  id: true,
  title: true,
  price: true,
  images: true,
} satisfies Prisma.ProductSelect;

export const adminRepository = {
  /**
   * The raw figures behind the admin dashboard, for customer orders only. Reads only: it never changes data.
   * `since` starts the current period and `previousSince` the one before it, for comparing sales.
   */
  async getDashboardData(since: Date, previousSince: Date, lowStock: number) {
    const customerOrder: Prisma.OrderWhereInput = {
      orderNumber: { not: 'MFS-82914' },
      user: { role: 'CUSTOMER' },
    };
    const notCancelled: Prisma.OrderWhereInput = { status: { notIn: ['CANCELLATION_APPROVED', 'CANCELLED'] } };

    const [
      statusCounts,
      refundsDue,
      refundsFailed,
      periodOrders,
      codDue,
      soldItems,
      activeProducts,
      pausedProducts,
      inactiveProducts,
      outOfStock,
      lowStockCount,
      stockAlerts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.groupBy({ by: ['status'], where: customerOrder, _count: { _all: true } }),
      // Cancelled after the customer paid, and the money hasn't gone back yet.
      prisma.order.count({
        where: {
          ...customerOrder,
          status: { in: ['CANCELLATION_APPROVED', 'CANCELLED'] },
          paymentStatus: 'PAID',
          refunds: { none: { status: { in: ['PROCESSING', 'PROCESSED'] } } },
        },
      }),
      prisma.order.count({
        where: {
          ...customerOrder,
          refunds: { some: { status: 'FAILED' }, none: { status: { in: ['PROCESSING', 'PROCESSED'] } } },
        },
      }),
      prisma.order.findMany({
        where: { ...customerOrder, ...notCancelled, createdAt: { gte: previousSince } },
        select: { total: true, createdAt: true },
      }),
      prisma.order.aggregate({
        where: {
          ...customerOrder,
          paymentMethod: 'COD',
          status: { notIn: ['DELIVERED', 'CANCELLATION_APPROVED', 'CANCELLED'] },
        },
        _sum: { total: true },
        _count: { _all: true },
      }),
      prisma.orderItem.findMany({
        where: { order: { ...customerOrder, ...notCancelled, createdAt: { gte: since } } },
        select: { productId: true, title: true, image: true, price: true, quantity: true },
      }),
      prisma.product.count({ where: { isActive: true, isPaused: false } }),
      prisma.product.count({ where: { isActive: true, isPaused: true } }),
      prisma.product.count({ where: { isActive: false } }),
      prisma.product.count({ where: { isActive: true, stock: 0 } }),
      prisma.product.count({ where: { isActive: true, stock: { gt: 0, lt: lowStock } } }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lt: lowStock } },
        orderBy: [{ stock: 'asc' }, { title: 'asc' }],
        take: 6,
        select: { id: true, title: true, stock: true, images: true, isPaused: true },
      }),
      prisma.order.findMany({
        where: customerOrder,
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
          shippingAddress: true,
          user: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    return {
      statusCounts: statusCounts.map((row) => ({ status: row.status, count: row._count._all })),
      refundsDue,
      refundsFailed,
      periodOrders,
      codDue: { amount: codDue._sum.total ?? 0, orders: codDue._count._all },
      soldItems,
      catalog: { activeProducts, pausedProducts, inactiveProducts, outOfStock, lowStock: lowStockCount },
      stockAlerts,
      recentOrders,
    };
  },

  async findProducts(query: AdminProductQueryInput) {
    const where: Prisma.ProductWhereInput = {};

    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

    if (query.lowStock) {
      where.stock = { lte: 5 };
    }

    if (query.category && query.category !== 'All') {
      where.category = {
        OR: [
          { name: { equals: query.category, mode: 'insensitive' } },
          { slug: { equals: query.category, mode: 'insensitive' } },
        ],
      };
    }

    if (query.q && query.q.trim()) {
      const term = query.q.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { maker: { contains: term, mode: 'insensitive' } },
        { tags: { has: term } },
      ];
    }

    const total = await prisma.product.count({ where });
    const totalPages = Math.ceil(total / query.pageSize);
    // Stay in range, e.g. after deleting the only product on the last page.
    const page = Math.min(Math.max(1, Math.floor(query.page)), Math.max(1, totalPages));

    const items = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * query.pageSize,
      take: query.pageSize,
      select: {
        id: true,
        title: true,
        images: true,
        price: true,
        comparePrice: true,
        discount: true,
        stock: true,
        isActive: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return { items, total, page, totalPages };
  },

  async getProductStockStats() {
    const [total, healthy, low, outOfStock] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { stock: { gte: 10 } } }),
      prisma.product.count({ where: { stock: { gt: 0, lt: 10 } } }),
      prisma.product.count({ where: { stock: 0 } }),
    ]);
    return { total, healthy, low, outOfStock };
  },

  async countOrderItemsForProduct(productId: string) {
    return prisma.orderItem.count({ where: { productId } });
  },

  /** Orders that contain the product and are still open (see `openOrder`), plus every order line that names it. */
  async countProductOrders(productId: string, openOrder: Prisma.OrderWhereInput) {
    const [openOrders, orderItems] = await Promise.all([
      prisma.order.count({ where: { AND: [openOrder, { items: { some: { productId } } }] } }),
      prisma.orderItem.count({ where: { productId } }),
    ]);
    return { openOrders, orderItems };
  },

  async createProduct(data: CreateProductInput) {
    const resolvedCategoryId = await resolveCategoryId(data.categoryId);

    const baseSlug = (data.slug || data.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return prisma.product.create({
      data: {
        title: data.title || data.name || '',
        slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice ?? data.originalPrice ?? null,
        stock: data.stock,
        images: data.images,
        maker: data.maker || 'Miracle Feng Shui Studio',
        makerSales: data.makerSales ?? data.salesCount ?? 0,
        starSeller: data.starSeller ?? false,
        bestseller: data.bestseller ?? false,
        etsyPick: data.etsyPick ?? false,
        freeShipping: data.freeShipping ?? true,
        discount: data.discount ?? null,
        itemDetails: data.itemDetails ?? data.highlights ?? [],
        materials: data.materials ?? [],
        tags: data.tags ?? [],
        variations: data.variations ?? Prisma.JsonNull,
        allowsPersonalization: data.allowsPersonalization ?? data.personalizationRequired ?? false,
        personalizationPrompt: data.personalizationPrompt ?? data.personalizationInstruction ?? null,
        inDemandCount: data.inDemandCount ?? 0,
        isActive: data.isActive ?? true,
        isPaused: data.isPaused ?? false,
        isFeatured: data.isFeatured ?? false,
        showStockLeft: data.showStockLeft ?? false,
        ratingAvg: data.rating ?? 0,
        categoryId: resolvedCategoryId,
      },
      include: {
        category: true,
        ...productReviewCount,
      },
    });
  },

  async updateProduct(id: string, data: UpdateProductInput) {
    const categoryIdentifier = data.categoryId || data.category;
    const resolvedCategoryId = categoryIdentifier
      ? await resolveCategoryId(categoryIdentifier)
      : undefined;

    return prisma.product.update({
      where: { id },
      data: {
        title: data.title || data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice ?? data.originalPrice,
        stock: data.stock,
        images: data.images,
        maker: data.maker,
        makerSales: data.makerSales ?? data.salesCount,
        starSeller: data.starSeller,
        bestseller: data.bestseller,
        etsyPick: data.etsyPick,
        freeShipping: data.freeShipping,
        discount: data.discount,
        itemDetails: data.itemDetails ?? data.highlights,
        materials: data.materials,
        tags: data.tags,
        variations: data.variations,
        allowsPersonalization: data.allowsPersonalization ?? data.personalizationRequired,
        personalizationPrompt: data.personalizationPrompt ?? data.personalizationInstruction,
        inDemandCount: data.inDemandCount,
        isActive: data.isActive,
        isPaused: data.isPaused,
        isFeatured: data.isFeatured,
        showStockLeft: data.showStockLeft,
        ratingAvg: data.rating,
        categoryId: resolvedCategoryId,
      },
      include: {
        category: true,
        ...productReviewCount,
      },
    });
  },

  async deleteProduct(id: string, hardDelete = false) {
    if (hardDelete) {
      return prisma.product.delete({ where: { id } });
    }
    // Soft delete by default
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async findAllOrders(filters?: { statuses?: OrderStatus[]; search?: string }) {
    const where: Prisma.OrderWhereInput = {
      orderNumber: { not: 'MFS-82914' },
      user: { role: 'CUSTOMER' },
    };

    if (filters?.statuses?.length) {
      where.status = { in: filters.statuses };
    }

    if (filters?.search && filters.search.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { orderNumber: { contains: term, mode: 'insensitive' } },
        { user: { name: { contains: term, mode: 'insensitive' } } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
      ];
    }

    return prisma.order.findMany({
      where,
      include: {
        refunds: { orderBy: { createdAt: 'desc' } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateOrderStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
  },

  // Customer drawer queries. Each one returns null unless the id belongs to a
  // CUSTOMER. Results go to the browser, so they use allowlists: never select
  // passwordHash or resetToken*.
  /** Customers only: an admin account can't be deactivated from here. Null when no such customer. */
  async setCustomerDeactivatedAt(id: string, deactivatedAt: Date | null) {
    const { count } = await prisma.user.updateMany({ where: { id, role: 'CUSTOMER' }, data: { deactivatedAt } });
    if (count === 0) return null;
    return prisma.user.findUnique({ where: { id }, select: { id: true, deactivatedAt: true } });
  },

  async findCustomerProfile(id: string) {
    return prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        deactivatedAt: true,
        // Default address first, so the drawer lists them in a sensible order.
        addresses: {
          orderBy: { isDefault: 'desc' },
          select: {
            id: true,
            name: true,
            phone: true,
            line1: true,
            line2: true,
            city: true,
            state: true,
            pincode: true,
            country: true,
            isDefault: true,
          },
        },
        _count: { select: { orders: true, favorites: true } },
      },
    });
  },

  // The id tiebreak keeps paging stable when rows share a createdAt.
  async findCustomerFavorites(id: string, range: { skip: number; take: number }) {
    return prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: {
        favorites: {
          ...range,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            createdAt: true,
            product: { select: CUSTOMER_PRODUCT_SELECT },
          },
        },
        _count: { select: { favorites: true } },
      },
    });
  },

  async findCustomerCart(id: string, range: { skip: number; take: number }) {
    return prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: {
        cart: {
          select: {
            items: {
              ...range,
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              select: {
                id: true,
                quantity: true,
                product: { select: CUSTOMER_PRODUCT_SELECT },
              },
            },
            _count: { select: { items: true } },
          },
        },
      },
    });
  },

  // Every cart line, for totals that must cover items not loaded yet.
  async findCustomerCartTotals(id: string) {
    return prisma.cartItem.findMany({
      where: { cart: { userId: id } },
      select: { quantity: true, product: { select: { price: true } } },
    });
  },

  async sumCustomerOrders(id: string) {
    const result = await prisma.order.aggregate({
      where: { userId: id },
      _sum: { total: true },
    });
    return result._sum.total ?? 0;
  },

  async findCustomerOrders(id: string, range: { skip: number; take: number }) {
    return prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: {
        _count: { select: { orders: true } },
        orders: {
          ...range,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            total: true,
            createdAt: true,
            items: {
              select: { id: true, title: true, price: true, quantity: true, image: true },
            },
          },
        },
      },
    });
  },
};
