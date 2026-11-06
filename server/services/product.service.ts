import { productRepository } from '../repositories/product.repository';
import { ProductQueryInput } from '../validators/product.validator';
import { ApiError } from '../utils/ApiError';
import { products as fallbackProducts, categories as fallbackCategories } from '@/lib/placeholder-data';

export const productService = {
  formatProduct(p: any) {
    // The review count only ever comes from the Review table, never from a stored number.
    const { ratingCount: _ratingCount, _count, ...product } = p;
    return {
      ...product,
      name: p.title || p.name,
      originalPrice: p.comparePrice ?? p.originalPrice,
      rating: p.ratingAvg ?? p.rating ?? 0,
      reviewCount: _count?.reviews ?? 0,
      category: p.category?.name || p.category,
    };
  },

  /** The fields for a product card, with only the first photo. */
  formatProductCard(p: any) {
    return {
      id: p.id,
      slug: p.slug,
      name: p.title || p.name,
      price: p.price,
      originalPrice: p.comparePrice ?? p.originalPrice,
      images: (p.images ?? []).slice(0, 1),
      stock: p.stock,
      bestseller: p.bestseller,
      category: p.category?.name || p.category,
      rating: p.ratingAvg ?? p.rating ?? 0,
      maker: p.maker,
    };
  },

  async list(query: ProductQueryInput) {
    try {
      const { items, total } = await productRepository.findMany(query);
      return {
        items: items.map(this.formatProductCard),
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      };
    } catch (dbErr) {
      console.warn('[productService] DB unreachable, serving fallback catalog products.');
      let filtered = [...fallbackProducts];
      if (query.category && query.category !== 'All') {
        filtered = filtered.filter(
          (p) => p.category.toLowerCase() === query.category?.toLowerCase()
        );
      }
      if (query.q && query.q.trim()) {
        const q = query.q.toLowerCase().trim();
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
      }
      const skip = (query.page - 1) * query.pageSize;
      const paginated = filtered.slice(skip, skip + query.pageSize);
      return {
        items: paginated.map(this.formatProductCard),
        total: filtered.length,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(filtered.length / query.pageSize),
      };
    }
  },

  async getBySlugOrId(identifier: string) {
    let product;
    try {
      product = await productRepository.findBySlugOrId(identifier);
    } catch {
      // The placeholder catalog is only for when the database can't be reached.
      product = fallbackProducts.find((p) => p.id === identifier);
    }
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return this.formatProduct(product);
  },

  /** The newest categories for the homepage. A category without its own image uses its newest product's photo. */
  async listLatestCategories(limit = 4) {
    try {
      const categories = await productRepository.findLatestCategories(limit);
      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        image: c.image || c.products[0]?.images[0] || '',
        productCount: c._count.products,
      }));
    } catch {
      console.warn('[productService] DB unreachable, no homepage categories.');
      return [];
    }
  },

  async listCategories() {
    try {
      const categories = await productRepository.findAllCategories();
      if (categories && categories.length > 0) {
        return categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: (c as any).imageUrl || (c as any).image || '',
          imageUrl: (c as any).imageUrl || (c as any).image || '',
          description: c.description,
          productCount: c._count?.products || 0,
        }));
      }
    } catch {
      // ignore and fallback
    }

    return fallbackCategories.filter((c) => c !== 'All').map((catName, idx) => ({
      id: `cat-${idx + 1}`,
      name: catName,
      slug: catName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
      image: '',
      imageUrl: '',
      description: `Authentic consecrated ${catName} cures and sacred items.`,
      productCount: fallbackProducts.filter((p) => p.category === catName).length,
    }));
  },

  async getAdminCategories(query: { q?: string; page: number; pageSize: number }) {
    const [result, all, productCounts] = await Promise.all([
      productRepository.findCategoriesPage(query),
      productRepository.findAllCategories(),
      productRepository.countProductsByCategoryAndStatus(),
    ]);

    const countFor = (categoryId: string, isActive: boolean) =>
      productCounts.find((row) => row.categoryId === categoryId && row.isActive === isActive)?.count ?? 0;
    const totalFor = (isActive: boolean) =>
      productCounts.filter((row) => row.isActive === isActive).reduce((sum, row) => sum + row.count, 0);

    return {
      categories: result.items.map((c) => {
        const activeCount = countFor(c.id, true);
        const inactiveCount = countFor(c.id, false);
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image || '',
          description: c.description || '',
          activeCount,
          inactiveCount,
          // Every linked product, which is what moves when the category is deleted.
          productCount: activeCount + inactiveCount,
        };
      }),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      // Whole-catalog figures, unaffected by the search or the current page.
      stats: {
        totalCategories: all.length,
        activeProducts: totalFor(true),
        inactiveProducts: totalFor(false),
      },
      // Every category is a valid target when reassigning products on delete.
      categoryOptions: all.map((c) => ({ id: c.id, name: c.name })),
    };
  },

  async createCategory(data: {
    name: string;
    description?: string;
    imageUrl?: string;
  }) {
    if (!data.name || !data.name.trim()) {
      throw ApiError.badRequest('Category name is required');
    }
    const cleanName = data.name.trim();

    // The slug is always generated from the name, using a numeric suffix if taken.
    // Names with no usable characters (e.g. "&&&") fall back to "category".
    const baseSlug =
      cleanName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'category';
    let slug = baseSlug;
    let counter = 2;
    while (await productRepository.findCategoryBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return productRepository.createCategory({
      name: cleanName,
      slug,
      description: data.description?.trim(),
      imageUrl: data.imageUrl?.trim(),
    });
  },

  async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
      imageUrl?: string;
    }
  ) {
    if (!(await productRepository.findCategoryById(id))) {
      throw ApiError.notFound('Category not found');
    }

    // The slug is fixed at creation, so renaming a category keeps its URL.
    return productRepository.updateCategory(id, {
      name: data.name?.trim(),
      description: data.description?.trim(),
      imageUrl: data.imageUrl?.trim(),
    });
  },

  async deleteCategory(id: string, reassignToCategoryId?: string) {
    if (!(await productRepository.findCategoryById(id))) {
      throw ApiError.notFound('Category not found');
    }
    return productRepository.deleteCategory(id, reassignToCategoryId);
  },
};

