import prisma from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma/client';
import { ProductQueryInput } from '../validators/product.validator';
import { ApiError } from '../utils/ApiError';

/** Prisma include for a product's exact review count. The Review table is the only source of it. */
/** Shown reviews only: hidden ones are on the admin Archive page and don't count in the store. */
export const productReviewCount = {
  _count: { select: { reviews: { where: { hiddenAt: null } } } },
} as const;

/** Only what a product card shows. A product's full details load when it's opened. */
const productCardSelect = {
  id: true,
  slug: true,
  title: true,
  price: true,
  comparePrice: true,
  images: true,
  stock: true,
  isPaused: true,
  bestseller: true,
  ratingAvg: true,
  maker: true,
  category: {
    select: { name: true, slug: true },
  },
} as const;

export const productRepository = {
  async findMany(query: ProductQueryInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

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
        { category: { name: { contains: term, mode: 'insensitive' } } },
        { tags: { has: term } },
      ];
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    if (query.minRating !== undefined) {
      where.ratingAvg = { gte: query.minRating };
    }

    if (query.freeShipping) {
      where.freeShipping = true;
    }

    if (query.onSale) {
      where.comparePrice = { gt: 0 };
    }

    // Miracle picks: products an admin ticked as a Miracle Pick.
    if (query.picks) {
      where.etsyPick = true;
    }

    // Sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'price_asc') orderBy = { price: 'asc' };
    else if (query.sort === 'price_desc') orderBy = { price: 'desc' };
    else if (query.sort === 'rating') orderBy = { ratingAvg: 'desc' };
    else if (query.sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (query.sort === 'relevancy') orderBy = { bestseller: 'desc' };

    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;

    const [items, total] = await Promise.all([
      client.product.findMany({
        where,
        orderBy: [orderBy, { id: 'desc' }],
        skip,
        take,
        select: productCardSelect,
      }),
      client.product.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.product.findUnique({
      where: { id },
      include: {
        category: true,
        ...productReviewCount,
      },
    });
  },

  async findBySlugOrId(identifier: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        isActive: true,
      },
      include: {
        category: true,
        ...productReviewCount,
      },
    });
  },

  async findCategoryById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.category.findUnique({ where: { id } });
  },

  async findCategoryBySlug(slug: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.category.findUnique({ where: { slug } });
  },

  async findCategoriesPage(query: { q?: string; page: number; pageSize: number }) {
    const term = query.q?.trim();
    const where: Prisma.CategoryWhereInput = term
      ? {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { slug: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        }
      : {};

    const total = await prisma.category.count({ where });
    const totalPages = Math.ceil(total / query.pageSize);
    // Stay in range, e.g. after deleting the only category on the last page.
    const page = Math.min(Math.max(1, query.page), Math.max(1, totalPages));

    const items = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * query.pageSize,
      take: query.pageSize,
      include: { _count: { select: { products: true } } },
    });

    return { items, total, page, totalPages };
  },

  async countProductsByCategoryAndStatus() {
    const rows = await prisma.product.groupBy({
      by: ['categoryId', 'isActive'],
      _count: { _all: true },
    });
    return rows.map((row) => ({
      categoryId: row.categoryId,
      isActive: row.isActive,
      count: row._count._all,
    }));
  },

  /** The newest categories with their shop product count and the newest product's photos, for the homepage. */
  async findLatestCategories(limit: number) {
    return prisma.category.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      select: {
        id: true,
        name: true,
        image: true,
        _count: { select: { products: { where: { isActive: true } } } },
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { images: true },
        },
      },
    });
  },

  /** Products an admin has marked as bestsellers, newest first. */
  async findBestsellers(limit: number) {
    return prisma.product.findMany({
      where: { isActive: true, bestseller: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      select: productCardSelect,
    });
  },

  async findAllCategories(tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  },

  async createCategory(
    data: { name: string; slug: string; description?: string; imageUrl?: string; image?: string },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image || data.imageUrl || null,
      },
    });
  },

  async updateCategory(
    id: string,
    data: { name?: string; slug?: string; description?: string; imageUrl?: string; image?: string },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.imageUrl !== undefined || data.image !== undefined) {
      updatePayload.image = data.image || data.imageUrl || null;
    }
    return client.category.update({
      where: { id },
      data: updatePayload,
    });
  },

  async deleteCategory(
    id: string,
    reassignToCategoryId?: string,
    tx?: Prisma.TransactionClient
  ) {
    // The move and the delete succeed or fail together.
    const run = async (client: Prisma.TransactionClient) => {
      const productCount = await client.product.count({ where: { categoryId: id } });
      if (productCount > 0) {
        if (!reassignToCategoryId) {
          throw ApiError.badRequest(
            `Cannot delete category with ${productCount} assigned products. Please select a category to reassign them to.`
          );
        }
        if (reassignToCategoryId === id) {
          throw ApiError.badRequest('Products cannot be moved to the category being deleted.');
        }
        const target = await client.category.findUnique({ where: { id: reassignToCategoryId } });
        if (!target) {
          throw ApiError.badRequest('The category selected for these products does not exist.');
        }
        await client.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: reassignToCategoryId },
        });
      }
      return client.category.delete({ where: { id } });
    };

    return tx ? run(tx) : prisma.$transaction(run);
  },
};

