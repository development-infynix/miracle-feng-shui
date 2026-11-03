import { productRepository } from '../repositories/product.repository';
import { ProductQueryInput } from '../validators/product.validator';
import { ApiError } from '../utils/ApiError';
import { products as fallbackProducts, categories as fallbackCategories } from '@/lib/placeholder-data';

export const productService = {
  formatProduct(p: any) {
    return {
      ...p,
      name: p.title || p.name,
      originalPrice: p.comparePrice ?? p.originalPrice,
      rating: p.ratingAvg ?? p.rating ?? 5,
      reviewCount: p.ratingCount ?? p.reviewCount ?? 0,
      category: p.category?.name || p.category,
    };
  },

  async list(query: ProductQueryInput) {
    try {
      const { items, total } = await productRepository.findMany(query);
      return {
        items: items.map(this.formatProduct),
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
        items: paginated.map(this.formatProduct),
        total: filtered.length,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(filtered.length / query.pageSize),
      };
    }
  },

  async getBySlugOrId(identifier: string) {
    try {
      const product = await productRepository.findBySlugOrId(identifier);
      if (product) return this.formatProduct(product);
    } catch {
      // ignore and fallback
    }
    const fallback = fallbackProducts.find((p) => p.id === identifier);
    if (!fallback) {
      throw ApiError.notFound('Product not found');
    }
    return this.formatProduct(fallback);
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

  async createCategory(data: {
    name: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
  }) {
    if (!data.name || !data.name.trim()) {
      throw ApiError.badRequest('Category name is required');
    }
    const cleanName = data.name.trim();
    const slug =
      data.slug?.trim() ||
      cleanName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

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
      slug?: string;
      description?: string;
      imageUrl?: string;
    }
  ) {
    const slug = data.slug
      ? data.slug.trim()
      : data.name
      ? data.name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      : undefined;

    return productRepository.updateCategory(id, {
      name: data.name?.trim(),
      slug,
      description: data.description?.trim(),
      imageUrl: data.imageUrl?.trim(),
    });
  },

  async deleteCategory(id: string, reassignToCategoryId?: string) {
    return productRepository.deleteCategory(id, reassignToCategoryId);
  },
};

