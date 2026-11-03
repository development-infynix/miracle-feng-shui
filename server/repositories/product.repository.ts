import prisma from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma/client';
import { ProductQueryInput } from '../validators/product.validator';

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
        orderBy,
        skip,
        take,
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
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
        reviews: {
          include: {
            user: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
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
    const client = tx || prisma;
    const productCount = await client.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      if (reassignToCategoryId) {
        // Reassign existing products to the target category
        await client.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: reassignToCategoryId },
        });
      } else {
        throw new Error(
          `Cannot delete category with ${productCount} assigned products. Please select a category to reassign them to.`
        );
      }
    }
    return client.category.delete({
      where: { id },
    });
  },

  async updateRating(
    productId: string,
    ratingAvg: number,
    ratingCount: number,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.product.update({
      where: { id: productId },
      data: { ratingAvg, ratingCount },
    });
  },
};

