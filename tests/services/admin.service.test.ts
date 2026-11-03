import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminService } from '@/server/services/admin.service';
import { adminRepository } from '@/server/repositories/admin.repository';
import { productRepository } from '@/server/repositories/product.repository';

describe('adminService.deleteProduct', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refuses to hard-delete a product that is part of past orders', async () => {
    vi.spyOn(productRepository, 'findById').mockResolvedValueOnce({ id: 'prod-1' } as any);
    vi.spyOn(adminRepository, 'countOrderItemsForProduct').mockResolvedValueOnce(2);
    const deleteSpy = vi.spyOn(adminRepository, 'deleteProduct');

    await expect(adminService.deleteProduct('prod-1', true)).rejects.toMatchObject({
      statusCode: 409,
    });

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('hard-deletes a product with no orders', async () => {
    vi.spyOn(productRepository, 'findById').mockResolvedValueOnce({ id: 'prod-1' } as any);
    vi.spyOn(adminRepository, 'countOrderItemsForProduct').mockResolvedValueOnce(0);
    const deleteSpy = vi.spyOn(adminRepository, 'deleteProduct').mockResolvedValueOnce({} as any);

    await adminService.deleteProduct('prod-1', true);

    expect(deleteSpy).toHaveBeenCalledWith('prod-1', true);
  });

  it('allows a soft delete without checking orders', async () => {
    vi.spyOn(productRepository, 'findById').mockResolvedValueOnce({ id: 'prod-1' } as any);
    const countSpy = vi.spyOn(adminRepository, 'countOrderItemsForProduct');
    const deleteSpy = vi.spyOn(adminRepository, 'deleteProduct').mockResolvedValueOnce({} as any);

    await adminService.deleteProduct('prod-1');

    expect(countSpy).not.toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith('prod-1', false);
  });
});
