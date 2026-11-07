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

describe('adminService.getDashboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const now = new Date('2026-11-07T12:00:00Z');
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const raw = (overrides: Partial<Awaited<ReturnType<typeof adminRepository.getDashboardData>>> = {}) => ({
    statusCounts: [],
    refundsDue: 0,
    refundsFailed: 0,
    periodOrders: [],
    codDue: { amount: 0, orders: 0 },
    soldItems: [],
    catalog: { activeProducts: 0, pausedProducts: 0, inactiveProducts: 0, outOfStock: 0, lowStock: 0 },
    stockAlerts: [],
    recentOrders: [],
    ...overrides,
  });

  it('counts COD orders as to confirm, and paid online orders as to pack', async () => {
    vi.spyOn(adminRepository, 'getDashboardData').mockResolvedValueOnce(
      raw({
        statusCounts: [
          { status: 'COD_PENDING', count: 2 },
          { status: 'PENDING', count: 1 },
          { status: 'PAID', count: 5 },
          { status: 'PROCESSING', count: 1 },
          { status: 'SHIPPED', count: 3 },
          { status: 'CANCELLATION_REQUESTED', count: 1 },
          { status: 'DELIVERED', count: 9 },
        ] as any,
        refundsDue: 1,
      })
    );

    const { action, totalOrders } = await adminService.getDashboard(now);

    expect(action).toEqual({ toConfirm: 3, toPack: 6, inTransit: 3, cancellationRequests: 1, refundsDue: 1, refundsFailed: 0 });
    expect(totalOrders).toBe(22);
  });

  it('compares the last 30 days of sales with the 30 before', async () => {
    const spy = vi.spyOn(adminRepository, 'getDashboardData').mockResolvedValueOnce(
      raw({
        periodOrders: [
          { total: 300, createdAt: daysAgo(1) },
          { total: 100, createdAt: daysAgo(10) },
          { total: 200, createdAt: daysAgo(40) },
        ],
      })
    );

    const { sales } = await adminService.getDashboard(now);

    expect(spy).toHaveBeenCalledWith(daysAgo(30), daysAgo(60), 10);
    expect(sales).toMatchObject({ revenue: 400, previousRevenue: 200, revenueChange: 1, orders: 2, previousOrders: 1, averageOrder: 200 });
  });

  it('shows no change figure when nothing sold in the period before', async () => {
    vi.spyOn(adminRepository, 'getDashboardData').mockResolvedValueOnce(raw({ periodOrders: [{ total: 50, createdAt: daysAgo(2) }] }));

    const { sales } = await adminService.getDashboard(now);

    expect(sales.revenueChange).toBeNull();
  });

  it('ranks best sellers by units sold, adding up every order line for a product', async () => {
    vi.spyOn(adminRepository, 'getDashboardData').mockResolvedValueOnce(
      raw({
        soldItems: [
          { productId: 'a', title: 'Bell', image: 'a.jpg', price: 100, quantity: 1 },
          { productId: 'b', title: 'Coin', image: 'b.jpg', price: 50, quantity: 2 },
          { productId: 'a', title: 'Bell', image: 'a.jpg', price: 100, quantity: 2 },
        ],
      })
    );

    const { topProducts } = await adminService.getDashboard(now);

    expect(topProducts.map((p) => [p.productId, p.units, p.revenue])).toEqual([
      ['a', 3, 300],
      ['b', 2, 100],
    ]);
  });
});

describe('adminService.getOrders status filter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('includes paid online orders under Processing and COD orders under Pending', async () => {
    const spy = vi.spyOn(adminRepository, 'findAllOrders').mockResolvedValue([]);

    await adminService.getOrders({ status: 'PROCESSING' });
    await adminService.getOrders({ status: 'PENDING' });
    await adminService.getOrders({ status: 'SHIPPED' });
    await adminService.getOrders({ status: 'all' });

    expect(spy.mock.calls.map((c) => c[0]?.statuses)).toEqual([
      ['PAID', 'PROCESSING'],
      ['PENDING', 'COD_PENDING'],
      ['SHIPPED'],
      undefined,
    ]);
  });
});
