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
});
