import { afterEach, describe, expect, it, vi } from 'vitest';
import { customerTimeline } from '@/server/services/orderTimeline';
import { adminService } from '@/server/services/admin.service';
import { adminRepository } from '@/server/repositories/admin.repository';
import { orderRepository } from '@/server/repositories/order.repository';

const ev = (toStatus: string, day: number) => ({ toStatus: toStatus as any, createdAt: new Date(Date.UTC(2026, 10, day)) });
const steps = (order: Parameters<typeof customerTimeline>[0]) => customerTimeline(order).map((e) => e.step);
const placedOn = new Date(Date.UTC(2026, 10, 1));

afterEach(() => vi.restoreAllMocks());

describe('customer timeline', () => {
  it('shows the main steps with their dates, and hides Processing', () => {
    const timeline = customerTimeline({
      createdAt: placedOn,
      statusEvents: [ev('PAID', 1), ev('PROCESSING', 2), ev('SHIPPED', 3), ev('DELIVERED', 5)],
    });
    expect(timeline).toEqual([
      { step: 'placed', at: '2026-11-01T00:00:00.000Z' },
      { step: 'shipped', at: '2026-11-03T00:00:00.000Z' },
      { step: 'delivered', at: '2026-11-05T00:00:00.000Z' },
    ]);
  });

  it('drops steps an admin corrected back, so it matches where the order really is', () => {
    expect(
      steps({ createdAt: placedOn, statusEvents: [ev('PAID', 1), ev('SHIPPED', 2), ev('DELIVERED', 3), ev('SHIPPED', 4)] })
    ).toEqual(['placed', 'shipped']);
  });

  it('shows a cancellation and the refund that followed', () => {
    expect(
      steps({
        createdAt: placedOn,
        refundRequestedAt: new Date(Date.UTC(2026, 10, 4)),
        statusEvents: [ev('PAID', 1), ev('CANCELLATION_REQUESTED', 2), ev('CANCELLATION_APPROVED', 3)],
        refunds: [{ status: 'PROCESSED', updatedAt: new Date(Date.UTC(2026, 10, 6)) }],
      })
    ).toEqual(['placed', 'cancellation_requested', 'cancelled', 'refund_requested', 'refunded']);
  });

  it('drops a cancellation request that was declined (the order went back to being prepared)', () => {
    expect(steps({ createdAt: placedOn, statusEvents: [ev('PAID', 1), ev('CANCELLATION_REQUESTED', 2), ev('PROCESSING', 3)] })).toEqual([
      'placed',
    ]);
  });

  it('shows Placed only once, even if payment arrives after the order was opened', () => {
    expect(steps({ createdAt: placedOn, statusEvents: [ev('PENDING', 1), ev('PAID', 2)] })).toEqual(['placed']);
  });

  it('still shows Placed for an order with no history at all', () => {
    expect(customerTimeline({ createdAt: placedOn })).toEqual([{ step: 'placed', at: '2026-11-01T00:00:00.000Z' }]);
  });

  it('does not show a refund that has not gone through', () => {
    expect(
      steps({ createdAt: placedOn, statusEvents: [ev('PAID', 1)], refunds: [{ status: 'PROCESSING', updatedAt: new Date() }] })
    ).toEqual(['placed']);
  });
});

describe('history is written with every admin change', () => {
  const updated = { id: 'o1', createdAt: new Date(), shippingAddress: {}, items: [], status: 'SHIPPED', total: 1 };

  it('records the change, what it was before, and which admin made it', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue({ id: 'o1', status: 'PAID', deliveredAt: null, refunds: [] } as any);
    const save = vi.spyOn(adminRepository, 'updateOrderStatus').mockResolvedValue(updated as any);

    await adminService.updateOrderStatus('o1', { status: 'SHIPPED' } as any, 'admin-1');

    expect(save).toHaveBeenCalledWith('o1', 'SHIPPED', null, { fromStatus: 'PAID', adminId: 'admin-1', note: null });
  });

  it('adds nothing when the same status is saved again', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue({ id: 'o1', status: 'SHIPPED', deliveredAt: null, refunds: [] } as any);
    const save = vi.spyOn(adminRepository, 'updateOrderStatus').mockResolvedValue(updated as any);

    await adminService.updateOrderStatus('o1', { status: 'SHIPPED' } as any, 'admin-1');

    expect(save.mock.calls[0][3]).toBeNull();
  });
});

describe('admin history view', () => {
  it('lists each change with readable statuses and who made it', async () => {
    vi.spyOn(adminRepository, 'findOrderHistory').mockResolvedValue({
      statusEvents: [
        { id: 'e1', fromStatus: null, toStatus: 'PAID', actor: 'SYSTEM', note: 'Payment confirmed', createdAt: placedOn, changedBy: null },
        { id: 'e2', fromStatus: 'PAID', toStatus: 'SHIPPED', actor: 'ADMIN', note: null, createdAt: placedOn, changedBy: { name: 'Owner', email: 'o@x.com' } },
      ],
    } as any);

    const history = await adminService.getOrderHistory('o1');

    expect(history[0]).toMatchObject({ from: null, actor: 'SYSTEM', by: null, note: 'Payment confirmed' });
    expect(history[1]).toMatchObject({ actor: 'ADMIN', by: 'Owner' });
    expect(history[1].to).not.toBe('SHIPPED'); // a readable label, not the raw database value
  });

  it('404s for an unknown order', async () => {
    vi.spyOn(adminRepository, 'findOrderHistory').mockResolvedValue(null);
    await expect(adminService.getOrderHistory('missing')).rejects.toThrow('Order not found');
  });
});
