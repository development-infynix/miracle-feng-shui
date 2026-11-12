import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { adminService, IN_PROGRESS_ORDER_STATUSES, OPEN_ORDER_WHERE } from '@/server/services/admin.service';
import * as s3 from '@/lib/s3';
import { adminRepository } from '@/server/repositories/admin.repository';
import { productRepository } from '@/server/repositories/product.repository';

// Real key parsing, no real storage calls.
vi.mock('@/lib/s3', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/s3')>()),
  deleteFromS3: vi.fn(),
}));

describe('adminService.archiveProduct', () => {
  beforeEach(() => {
    vi.spyOn(adminRepository, 'countCheckoutsWithProduct').mockResolvedValue(0);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const withOpenOrders = (openOrders: number, stock = 0) => {
    vi.spyOn(productRepository, 'findById').mockResolvedValueOnce({ id: 'prod-1', stock, isActive: true } as any);
    vi.spyOn(adminRepository, 'countOpenProductOrders').mockResolvedValueOnce(openOrders);
    return vi.spyOn(adminRepository, 'archiveProduct').mockResolvedValue({} as any);
  };

  it('refuses while the product is in an open order, and changes nothing', async () => {
    const archiveSpy = withOpenOrders(2);

    await expect(adminService.archiveProduct('prod-1')).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('2 open orders'),
    });

    expect(archiveSpy).not.toHaveBeenCalled();
  });

  it('archives a product in no open order, whatever its stock', async () => {
    const archiveSpy = withOpenOrders(0, 12);

    await expect(adminService.archiveProduct('prod-1')).resolves.toMatchObject({ result: 'archived' });

    expect(archiveSpy).toHaveBeenCalledWith('prod-1');
  });

  it('refuses while a customer is paying for the product', async () => {
    const archiveSpy = withOpenOrders(0);
    vi.mocked(adminRepository.countCheckoutsWithProduct).mockResolvedValueOnce(1);

    await expect(adminService.archiveProduct('prod-1')).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('paying'),
    });
    expect(archiveSpy).not.toHaveBeenCalled();
  });

  it('starts the two weeks when archiving through the status picker, and clears them on restore', async () => {
    vi.spyOn(productRepository, 'findById').mockResolvedValueOnce({ id: 'prod-1', isActive: true } as any);
    vi.spyOn(adminRepository, 'countOpenProductOrders').mockResolvedValueOnce(0);
    const updateSpy = vi.spyOn(adminRepository, 'updateProduct').mockResolvedValue({} as any);
    await adminService.updateProduct('prod-1', { isActive: false } as any);
    expect(updateSpy.mock.calls[0][2]).toBeInstanceOf(Date);

    vi.spyOn(productRepository, 'findById').mockResolvedValueOnce({ id: 'prod-1', isActive: false } as any);
    await adminService.updateProduct('prod-1', { isActive: true } as any);
    expect(updateSpy.mock.calls[1][2]).toBeNull();

    vi.spyOn(productRepository, 'findById').mockResolvedValueOnce({ id: 'prod-1', isActive: false } as any);
    await adminService.updateProduct('prod-1', { price: 10 } as any);
    expect(updateSpy.mock.calls[2][2]).toBeUndefined();
  });

  it('applies the open-order rule when archiving through the status picker too', async () => {
    vi.spyOn(productRepository, 'findById').mockResolvedValueOnce({ id: 'prod-1', isActive: true } as any);
    vi.spyOn(adminRepository, 'countOpenProductOrders').mockResolvedValueOnce(1);
    const updateSpy = vi.spyOn(adminRepository, 'updateProduct').mockResolvedValue({} as any);

    await expect(adminService.updateProduct('prod-1', { isActive: false } as any)).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('1 open order'),
    });
    expect(updateSpy).not.toHaveBeenCalled();
  });
});

describe('open orders, for product removal', () => {
  beforeEach(() => {
    vi.spyOn(adminRepository, 'countCheckoutsWithProduct').mockResolvedValue(0);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks the repository with the open-order rule', async () => {
    const countSpy = vi.spyOn(adminRepository, 'countOpenProductOrders').mockResolvedValueOnce(0);

    await adminService.getProductRemoval('prod-1');

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

describe('adminService.deleteProductPermanently', () => {
  const now = new Date('2026-11-30T12:00:00Z');
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  beforeEach(() => {
    vi.spyOn(adminRepository, 'countOpenProductOrders').mockResolvedValue(0);
    vi.spyOn(adminRepository, 'countCheckoutsWithProduct').mockResolvedValue(0);
    vi.spyOn(adminRepository, 'isImageInUse').mockResolvedValue(false);
    vi.mocked(s3.deleteFromS3).mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const product = (over: Record<string, unknown> = {}) =>
    vi.spyOn(productRepository, 'findById').mockResolvedValueOnce({
      id: 'prod-1',
      title: 'Jade Tree',
      isActive: false,
      archivedAt: daysAgo(15),
      images: ['/api/images/uploads/a.jpg', '/images/static.jpg'],
      makerAvatar: null,
      ...over,
    } as any);

  it('refuses a product that is not archived', async () => {
    product({ isActive: true, archivedAt: null });
    const deleteSpy = vi.spyOn(adminRepository, 'deleteArchivedProduct');
    await expect(adminService.deleteProductPermanently('prod-1', now)).rejects.toMatchObject({ statusCode: 409 });
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('refuses within two weeks of archiving, and says from when', async () => {
    product({ archivedAt: daysAgo(13) });
    const deleteSpy = vi.spyOn(adminRepository, 'deleteArchivedProduct');
    await expect(adminService.deleteProductPermanently('prod-1', now)).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('can be deleted from'),
    });
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('still refuses after two weeks if an order is open', async () => {
    product();
    vi.mocked(adminRepository.countOpenProductOrders).mockResolvedValueOnce(1);
    const deleteSpy = vi.spyOn(adminRepository, 'deleteArchivedProduct');
    await expect(adminService.deleteProductPermanently('prod-1', now)).rejects.toMatchObject({
      message: expect.stringContaining('deleted once'),
    });
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('deletes after two weeks, only if still archived since before the cut-off', async () => {
    product();
    const deleteSpy = vi.spyOn(adminRepository, 'deleteArchivedProduct').mockResolvedValueOnce(true);
    await expect(adminService.deleteProductPermanently('prod-1', now)).resolves.toMatchObject({ result: 'deleted' });
    expect(deleteSpy).toHaveBeenCalledWith('prod-1', daysAgo(14));
  });

  it('reports a restore that raced the delete', async () => {
    product();
    vi.spyOn(adminRepository, 'deleteArchivedProduct').mockResolvedValueOnce(false);
    await expect(adminService.deleteProductPermanently('prod-1', now)).rejects.toMatchObject({ statusCode: 409 });
    expect(s3.deleteFromS3).not.toHaveBeenCalled();
  });

  it('removes only its own uploaded photos that nothing else shows', async () => {
    product({ images: ['/api/images/uploads/a.jpg', '/api/images/uploads/b.jpg', '/images/static.jpg'] });
    vi.spyOn(adminRepository, 'deleteArchivedProduct').mockResolvedValueOnce(true);
    // b.jpg is the photo on a past order.
    vi.mocked(adminRepository.isImageInUse).mockImplementation(async (url) => url.endsWith('b.jpg'));

    await adminService.deleteProductPermanently('prod-1', now);

    expect(s3.deleteFromS3).toHaveBeenCalledTimes(1);
    expect(s3.deleteFromS3).toHaveBeenCalledWith('uploads/a.jpg');
  });

  it('still succeeds when a photo cannot be removed', async () => {
    product();
    vi.spyOn(adminRepository, 'deleteArchivedProduct').mockResolvedValueOnce(true);
    vi.mocked(s3.deleteFromS3).mockRejectedValueOnce(new Error('storage down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(adminService.deleteProductPermanently('prod-1', now)).resolves.toMatchObject({ result: 'deleted' });
  });
});

describe('objectKeyFromUrl', () => {
  it('only gives keys for our own image folders', () => {
    expect(s3.objectKeyFromUrl('/api/images/uploads/mfs_1.jpg')).toBe('uploads/mfs_1.jpg');
    expect(s3.objectKeyFromUrl('/api/images/products/jade%20tree.webp')).toBe('products/jade tree.webp');
    expect(s3.objectKeyFromUrl('/images/miracle.jpeg')).toBeNull();
    expect(s3.objectKeyFromUrl('/api/images/private/x.jpg')).toBeNull();
    expect(s3.objectKeyFromUrl('/api/images/uploads/../private/x.jpg')).toBeNull();
    expect(s3.objectKeyFromUrl('https://example.com/api/images/uploads/a.jpg')).toBeNull();
  });
});
