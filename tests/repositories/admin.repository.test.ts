import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  category: { findFirst: vi.fn(), create: vi.fn() },
  product: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ default: db }));

import { adminRepository } from '@/server/repositories/admin.repository';

const newProduct = {
  title: 'Jade Buddha',
  description: 'A hand-carved statue',
  price: 100,
  stock: 5,
  images: ['/image.jpg'],
  categoryId: 'Deleted Category',
} as any;

describe('adminRepository product status filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.product.findMany.mockResolvedValue([]);
    db.product.count.mockResolvedValue(0);
  });

  it.each([
    ['all', undefined],
    ['active', true],
    ['inactive', false],
  ])('status=%s filters isActive to %s', async (status, expected) => {
    await adminRepository.findProducts({ page: 1, pageSize: 20, status } as any);

    expect(db.product.findMany.mock.calls[0][0].where.isActive).toBe(expected);
  });
});

describe('adminRepository product categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.product.findUnique.mockResolvedValue(null);
  });

  it('rejects creating a product in a missing category without creating the category', async () => {
    db.category.findFirst.mockResolvedValue(null);

    await expect(adminRepository.createProduct(newProduct)).rejects.toMatchObject({
      statusCode: 400,
      message: 'Category "Deleted Category" does not exist.',
    });

    expect(db.category.create).not.toHaveBeenCalled();
    expect(db.product.create).not.toHaveBeenCalled();
  });

  it('creates a product using the id of the category found by name', async () => {
    db.category.findFirst.mockResolvedValue({ id: 'cat-1' });
    db.product.create.mockResolvedValue({ id: 'prod-1' });

    await adminRepository.createProduct({ ...newProduct, categoryId: 'Zen & Meditation' });

    expect(db.product.create.mock.calls[0][0].data.categoryId).toBe('cat-1');
  });

  it('rejects moving a product to a missing category', async () => {
    db.category.findFirst.mockResolvedValue(null);

    await expect(
      adminRepository.updateProduct('prod-1', { categoryId: 'Deleted Category' } as any)
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(db.product.update).not.toHaveBeenCalled();
  });

  it('leaves the category unchanged when an update does not mention one', async () => {
    db.product.update.mockResolvedValue({ id: 'prod-1' });

    await adminRepository.updateProduct('prod-1', { title: 'New title' } as any);

    expect(db.category.findFirst).not.toHaveBeenCalled();
    expect(db.product.update.mock.calls[0][0].data.categoryId).toBeUndefined();
  });
});
