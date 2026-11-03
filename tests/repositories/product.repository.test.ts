import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => {
  const client: any = {
    product: { count: vi.fn(), updateMany: vi.fn() },
    category: { findUnique: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn(),
  };
  client.$transaction.mockImplementation((run: (tx: unknown) => unknown) => run(client));
  return client;
});

vi.mock('@/lib/prisma', () => ({ default: db }));

import { productRepository } from '@/server/repositories/product.repository';

describe('productRepository.deleteCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes an empty category inside a transaction', async () => {
    db.product.count.mockResolvedValue(0);

    await productRepository.deleteCategory('cat-1');

    expect(db.$transaction).toHaveBeenCalledOnce();
    expect(db.product.updateMany).not.toHaveBeenCalled();
    expect(db.category.delete).toHaveBeenCalledWith({ where: { id: 'cat-1' } });
  });

  it('moves products, then deletes the category', async () => {
    db.product.count.mockResolvedValue(2);
    db.category.findUnique.mockResolvedValue({ id: 'cat-2' });

    await productRepository.deleteCategory('cat-1', 'cat-2');

    expect(db.$transaction).toHaveBeenCalledOnce();
    expect(db.product.updateMany).toHaveBeenCalledWith({
      where: { categoryId: 'cat-1' },
      data: { categoryId: 'cat-2' },
    });
    expect(db.category.delete).toHaveBeenCalledOnce();
  });

  it.each([
    ['no target', undefined],
    ['the same category', 'cat-1'],
    ['a missing category', 'missing'],
  ])('returns 400 when products would move to %s', async (_label, target) => {
    db.product.count.mockResolvedValue(2);
    db.category.findUnique.mockResolvedValue(null);

    await expect(productRepository.deleteCategory('cat-1', target)).rejects.toMatchObject({
      statusCode: 400,
    });

    expect(db.product.updateMany).not.toHaveBeenCalled();
    expect(db.category.delete).not.toHaveBeenCalled();
  });
});
