import { describe, it, expect, vi } from 'vitest';
import { productService } from '@/server/services/product.service';
import { productRepository } from '@/server/repositories/product.repository';

describe('ProductService', () => {
  it('should format a raw product with name, originalPrice, and category string', () => {
    const raw = {
      id: 'prod-123',
      title: 'Feng Shui Brass Bell',
      slug: 'feng-shui-brass-bell',
      price: 1200,
      comparePrice: 1500,
      ratingAvg: 4.8,
      ratingCount: 24,
      category: { name: 'Wind Chimes & Bells', slug: 'wind-chimes' },
    };

    const formatted = productService.formatProduct(raw);
    expect(formatted.name).toBe('Feng Shui Brass Bell');
    expect(formatted.originalPrice).toBe(1500);
    expect(formatted.category).toBe('Wind Chimes & Bells');
    expect(formatted.rating).toBe(4.8);
    expect(formatted.reviewCount).toBe(24);
  });

  it('should return paginated list of products', async () => {
    vi.spyOn(productRepository, 'findMany').mockResolvedValueOnce({
      items: [
        {
          id: 'prod-1',
          title: 'Citrine Money Tree',
          slug: 'citrine-money-tree',
          price: 2400,
          comparePrice: 2800,
          ratingAvg: 4.9,
          ratingCount: 15,
          category: { name: 'Crystals', slug: 'crystals' },
        } as any,
      ],
      total: 1,
    });

    const result = await productService.list({
      page: 1,
      pageSize: 10,
      sort: 'newest',
    });

    expect(result.total).toBe(1);
    expect(result.items.length).toBe(1);
    expect(result.items[0].name).toBe('Citrine Money Tree');
  });

  it('should throw ApiError if product not found by slug', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValueOnce(null);

    await expect(productService.getBySlugOrId('non-existent')).rejects.toThrow(
      'Product not found'
    );
  });

  it('should keep category stats catalog-wide when a search narrows the page', async () => {
    const pageSpy = vi.spyOn(productRepository, 'findCategoriesPage').mockResolvedValueOnce({
      items: [{ id: 'c1', name: 'Zen', slug: 'zen', image: null, description: null, _count: { products: 2 } }],
      total: 1,
      page: 1,
      totalPages: 1,
    } as any);
    const allSpy = vi.spyOn(productRepository, 'findAllCategories').mockResolvedValueOnce([
      { id: 'c1', name: 'Zen', _count: { products: 2 } },
      { id: 'c2', name: 'Decor', _count: { products: 16 } },
    ] as any);
    const countSpy = vi.spyOn(productRepository, 'countProductsByCategoryAndStatus').mockResolvedValueOnce([
      { categoryId: 'c1', isActive: true, count: 1 },
      { categoryId: 'c1', isActive: false, count: 1 },
      { categoryId: 'c2', isActive: true, count: 16 },
    ]);

    const result = await productService.getAdminCategories({ q: 'zen', page: 1, pageSize: 20 });

    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]).toMatchObject({
      image: '',
      description: '',
      activeCount: 1,
      inactiveCount: 1,
      productCount: 2,
    });
    expect(result.stats).toEqual({ totalCategories: 2, activeProducts: 17, inactiveProducts: 1 });
    expect(result.categoryOptions).toHaveLength(2);

    pageSpy.mockRestore();
    allSpy.mockRestore();
    countSpy.mockRestore();
  });

  it.each(['updateCategory', 'deleteCategory'] as const)('%s should return 404 for a missing category', async (method) => {
    vi.spyOn(productRepository, 'findCategoryById').mockResolvedValueOnce(null);

    await expect(
      method === 'updateCategory'
        ? productService.updateCategory('missing', { name: 'New name' })
        : productService.deleteCategory('missing')
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  describe('category slugs', () => {
    const createdSlug = async (name: string, takenSlugs: string[] = []) => {
      const findSpy = vi
        .spyOn(productRepository, 'findCategoryBySlug')
        .mockImplementation(async (slug) =>
          takenSlugs.includes(slug) ? ({ id: 'existing', slug } as any) : null
        );
      const createSpy = vi
        .spyOn(productRepository, 'createCategory')
        .mockResolvedValueOnce({ id: 'new' } as any);

      await productService.createCategory({ name });
      const slug = createSpy.mock.calls[0][0].slug;

      findSpy.mockRestore();
      createSpy.mockRestore();
      return slug;
    };

    it('should generate the slug from the name', async () => {
      expect(await createdSlug('Incense & Singing Bowls')).toBe('incense-singing-bowls');
    });

    it('should add a number when the slug is already taken', async () => {
      expect(await createdSlug('Zen Meditation', ['zen-meditation'])).toBe('zen-meditation-2');
      expect(
        await createdSlug('Zen Meditation', ['zen-meditation', 'zen-meditation-2'])
      ).toBe('zen-meditation-3');
    });

    it('should fall back when the name has no usable characters', async () => {
      expect(await createdSlug('&&&')).toBe('category');
    });

    it('should not change the slug when a category is renamed', async () => {
      vi.spyOn(productRepository, 'findCategoryById').mockResolvedValueOnce({ id: 'cat-1' } as any);
      const updateSpy = vi
        .spyOn(productRepository, 'updateCategory')
        .mockResolvedValueOnce({ id: 'cat-1' } as any);

      await productService.updateCategory('cat-1', { name: 'New Name' });

      expect(updateSpy.mock.calls[0][1]).not.toHaveProperty('slug');
      updateSpy.mockRestore();
    });
  });
});
