import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminService, IN_PROGRESS_ORDER_STATUSES, OPEN_ORDER_WHERE } from '@/server/services/admin.service';
import { adminRepository } from '@/server/repositories/admin.repository';
import { productRepository } from '@/server/repositories/product.repository';

describe('adminService.deleteProduct', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const withOrders = (openOrders: number, orderItems: number, stock = 0) => {
    vi.spyOn(productRepository, 'findById').mockResolvedValueOnce({ id: 'prod-1', stock } as any);
    vi.spyOn(adminRepository, 'countProductOrders').mockResolvedValueOnce({ openOrders, orderItems });
    return vi.spyOn(adminRepository, 'deleteProduct').mockResolvedValue({} as any);
  };

  it('refuses while the product is in an open order, and changes nothing', async () => {
    const deleteSpy = withOrders(2, 3);

    await expect(adminService.deleteProduct('prod-1')).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('2 open orders'),
    });

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('archives a product that is only in finished orders, keeping it for their history', async () => {
    const deleteSpy = withOrders(0, 1);

    await expect(adminService.deleteProduct('prod-1')).resolves.toMatchObject({ result: 'archived' });

    expect(deleteSpy).toHaveBeenCalledWith('prod-1', false);
  });

  it('archives a product in finished orders whatever its stock', async () => {
    const deleteSpy = withOrders(0, 1, 12);

    await expect(adminService.deleteProduct('prod-1')).resolves.toMatchObject({ result: 'archived' });

    expect(deleteSpy).toHaveBeenCalledWith('prod-1', false);
  });

  it('refuses to delete a product in no order that still has stock, and changes nothing', async () => {
    const deleteSpy = withOrders(0, 0, 5);

    await expect(adminService.deleteProduct('prod-1')).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('5 in stock'),
    });

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('refuses a product with stock while it is in an open order, naming the order', async () => {
    const deleteSpy = withOrders(1, 1, 5);

    await expect(adminService.deleteProduct('prod-1')).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('1 open order'),
    });

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('deletes a sold-out product that is in no order for good', async () => {
    const deleteSpy = withOrders(0, 0);

    await expect(adminService.deleteProduct('prod-1')).resolves.toMatchObject({ result: 'deleted' });

    expect(deleteSpy).toHaveBeenCalledWith('prod-1', true);
  });
});

describe('open orders, for product removal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks the repository with the open-order rule', async () => {
    const countSpy = vi.spyOn(adminRepository, 'countProductOrders').mockResolvedValueOnce({ openOrders: 0, orderItems: 0 });

    await adminService.getProductRemoval('prod-1', 0);

    expect(countSpy).toHaveBeenCalledWith('prod-1', OPEN_ORDER_WHERE);
  });

  it('counts orders in progress as open, and not delivered or cancelled ones', () => {
    expect(IN_PROGRESS_ORDER_STATUSES).toEqual(
      expect.arrayContaining(['PENDING', 'PAID', 'COD_PENDING', 'PROCESSING', 'SHIPPED', 'CANCELLATION_REQUESTED'])
    );
    for (const finished of ['DELIVERED', 'CANCELLATION_APPROVED', 'CANCELLED']) {
      expect(IN_PROGRESS_ORDER_STATUSES).not.toContain(finished);
    }
  });

  it('keeps a paid cancellation open until its refund is processed', () => {
    expect(OPEN_ORDER_WHERE.OR).toContainEqual({
      status: { in: ['CANCELLATION_APPROVED', 'CANCELLED'] },
      paymentStatus: 'PAID',
      refunds: { none: { status: 'PROCESSED' } },
    });
  });
});
