import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminService, OPEN_ORDER_WHERE } from '@/server/services/admin.service';
import { adminRepository } from '@/server/repositories/admin.repository';
import { orderRepository } from '@/server/repositories/order.repository';
import { isOrderOpen } from '@/app/admin/orders/types';

afterEach(() => vi.restoreAllMocks());

const order = (fields: Record<string, unknown>) =>
  vi.spyOn(orderRepository, 'findById').mockResolvedValue({ id: 'o1', status: 'DELIVERED', archivedAt: null, refunds: [], ...fields } as any);

describe('archiving an order', () => {
  it('archives a finished order, recording which admin did it and refusing open orders in the same step', async () => {
    order({});
    const save = vi.spyOn(adminRepository, 'setOrderArchived').mockResolvedValue(true);

    await expect(adminService.setOrderArchived('o1', true, 'admin-1')).resolves.toEqual({ id: 'o1', archived: true });
    expect(save).toHaveBeenCalledWith('o1', true, 'admin-1', OPEN_ORDER_WHERE);
  });

  it('refuses an open order, with the reason', async () => {
    order({ status: 'SHIPPED' });
    vi.spyOn(adminRepository, 'setOrderArchived').mockResolvedValue(false);

    await expect(adminService.setOrderArchived('o1', true, 'admin-1')).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('still open'),
    });
  });

  it('restores an archived order', async () => {
    order({ archivedAt: new Date() });
    const save = vi.spyOn(adminRepository, 'setOrderArchived').mockResolvedValue(true);

    await adminService.setOrderArchived('o1', false, 'admin-1');
    expect(save).toHaveBeenCalledWith('o1', false, 'admin-1', OPEN_ORDER_WHERE);
  });

  it('says so when the order is already in the asked state', async () => {
    order({ archivedAt: new Date() });
    const save = vi.spyOn(adminRepository, 'setOrderArchived');

    await expect(adminService.setOrderArchived('o1', true)).rejects.toMatchObject({ statusCode: 409 });
    expect(save).not.toHaveBeenCalled();
  });

  it('404s for an unknown order', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue(null);
    await expect(adminService.setOrderArchived('nope', true)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("blocks status changes on an archived order until it's restored", async () => {
    order({ archivedAt: new Date() });
    const save = vi.spyOn(adminRepository, 'updateOrderStatus');

    await expect(adminService.updateOrderStatus('o1', { status: 'SHIPPED' } as any, 'admin-1')).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(save).not.toHaveBeenCalled();
  });
});

describe('admin order history', () => {
  it('lists archive and restore between the status changes, by time', async () => {
    const at = (d: number) => new Date(Date.UTC(2026, 10, d));
    vi.spyOn(adminRepository, 'findOrderHistory').mockResolvedValue({
      statusEvents: [
        { id: 's1', fromStatus: null, toStatus: 'PAID', actor: 'SYSTEM', note: null, createdAt: at(1), changedBy: null },
        { id: 's2', fromStatus: 'PAID', toStatus: 'DELIVERED', actor: 'ADMIN', note: null, createdAt: at(3), changedBy: null },
      ],
      archiveEvents: [
        { id: 'a1', archived: true, createdAt: at(5), changedBy: { name: 'Asha', email: 'a@x.in' } },
        { id: 'a2', archived: false, createdAt: at(2), changedBy: null },
      ],
    } as any);

    const history = await adminService.getOrderHistory('o1');
    expect(history.map((h) => h.id)).toEqual(['s1', 'a2', 's2', 'a1']);
    expect(history[3]).toMatchObject({ to: 'Archived', actor: 'ADMIN', by: 'Asha' });
    expect(history[1]).toMatchObject({ to: 'Restored from archive' });
  });
});

describe('which orders the drawer offers to archive', () => {
  const o = (rawStatus: string, paymentStatus = 'PAID', refund: any = null) => isOrderOpen({ rawStatus, paymentStatus, refund });

  it('matches the server rule', () => {
    expect(o('SHIPPED')).toBe(true);
    expect(o('CANCELLATION_REQUESTED')).toBe(true);
    expect(o('CANCELLED')).toBe(true);
    expect(o('CANCELLED', 'PAID', { status: 'PROCESSING' })).toBe(true);
    expect(o('DELIVERED')).toBe(false);
    expect(o('CANCELLED', 'REFUNDED', { status: 'PROCESSED' })).toBe(false);
    expect(o('CANCELLED', 'PENDING')).toBe(false);
  });
});
