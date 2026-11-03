import prisma from '@/lib/prisma';
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

export const adminRepository = {
  async getDashboardStats() {
    // Automatically purge old demo seed orders if present
    try {
      await prisma.order.deleteMany({
        where: {
          OR: [
            { orderNumber: 'MFS-82914' },
            { user: { email: 'admin@miraclefengshui.com' } },
          ],
        },
      });
    } catch {
      // ignore if already deleted
    }

    const [
      orders,
      usersCount,
      productsCount,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: { not: 'CANCELLED' },
          orderNumber: { not: 'MFS-82914' },
          user: { role: 'CUSTOMER' },
        },
        select: {
          total: true,
          status: true,
        },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: {
          isActive: true,
          stock: { lte: 5 },
        },
        take: 10,
        orderBy: { stock: 'asc' },
      }),
      prisma.order.findMany({
        where: {
          orderNumber: { not: 'MFS-82914' },
          user: { role: 'CUSTOMER' },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true,
        },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
    const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrdersCount,
      usersCount,
      productsCount,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
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
        isFeatured: data.isFeatured ?? false,
        categoryId: resolvedCategoryId,
      },
      include: {
        category: true,
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
        isFeatured: data.isFeatured,
        categoryId: resolvedCategoryId,
      },
      include: {
        category: true,
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

  async findAllOrders(filters?: { status?: OrderStatus; search?: string }) {
    const where: Prisma.OrderWhereInput = {
      orderNumber: { not: 'MFS-82914' },
      user: { role: 'CUSTOMER' },
    };

    if (filters?.status) {
      where.status = filters.status;
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

  async getHomepageSections() {
    return prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
    });
  },

  async updateHomepageSections(
    sections: {
      id: string;
      sectionKey?: string;
      name?: string;
      title?: string;
      subtitle?: string | null;
      ctaText?: string | null;
      ctaLink?: string | null;
      badge?: string | null;
      order?: number;
      enabled?: boolean;
    }[]
  ) {
    return prisma.$transaction(
      sections.map((sec, idx) => {
        const order = sec.order !== undefined ? sec.order : idx;
        return prisma.homepageSection.upsert({
          where: {
            sectionKey: sec.sectionKey || sec.id,
          },
          update: {
            name: sec.name,
            title: sec.title,
            subtitle: sec.subtitle,
            ctaText: sec.ctaText,
            ctaLink: sec.ctaLink,
            badge: sec.badge,
            order,
            enabled: sec.enabled !== undefined ? sec.enabled : true,
          },
          create: {
            sectionKey: sec.sectionKey || sec.id,
            name: sec.name || sec.title || sec.id,
            title: sec.title || sec.id,
            subtitle: sec.subtitle,
            ctaText: sec.ctaText,
            ctaLink: sec.ctaLink,
            badge: sec.badge,
            order,
            enabled: sec.enabled !== undefined ? sec.enabled : true,
          },
        });
      })
    );
  },
};
