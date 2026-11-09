import { afterEach, describe, expect, it, vi } from 'vitest';
import { settingsService } from '@/server/services/settings.service';
import { settingsRepository } from '@/server/repositories/settings.repository';
import { orderService, NO_CANCELLATION_MESSAGE } from '@/server/services/order.service';
import { orderRepository } from '@/server/repositories/order.repository';
import { adminService } from '@/server/services/admin.service';
import { adminRepository } from '@/server/repositories/admin.repository';
import { generateTaxInvoiceHTML } from '@/lib/invoice';
import { NO_CANCELLATION_INVOICE_NOTE } from '@/lib/invoicePolicy';

const order = (overrides: Record<string, unknown> = {}) => ({
  id: 'o1',
  orderNumber: 'MFS-7KQ2-9XPA',
  userId: 'u1',
  status: 'PAID',
  paymentMethod: 'RAZORPAY',
  paymentStatus: 'PAID',
  total: 500,
  createdAt: new Date('2026-11-01T00:00:00Z'),
  cancellationRequestedAt: null,
  cancellationAllowed: true,
  items: [],
  refunds: [],
  shippingAddress: {},
  ...overrides,
});

const invoice = (cancellationAllowed?: boolean) =>
  generateTaxInvoiceHTML({
    orderId: 'MFS-7KQ2-9XPA',
    orderDate: '1 Nov 2026',
    customerName: 'Asha',
    deliveryAddress: '1 Road, Kochi',
    paymentMethod: 'UPI / Online Payment',
    paymentStatus: 'PAID',
    totalAmount: 500,
    cancellationAllowed,
    items: [{ name: 'Bell', quantity: 1, price: 500 }],
  });

afterEach(() => vi.restoreAllMocks());

describe('store cancellation setting', () => {
  it('reads and changes the one settings row', async () => {
    vi.spyOn(settingsRepository, 'get').mockResolvedValue({ cancellationAllowed: false } as any);
    expect(await settingsService.getPublic()).toEqual({ cancellationAllowed: false });

    const set = vi.spyOn(settingsRepository, 'setCancellationAllowed').mockResolvedValue({ cancellationAllowed: true } as any);
    await settingsService.setCancellationAllowed(true, 'admin-1');
    expect(set).toHaveBeenCalledWith(true, 'admin-1');
  });
});

describe('orders bought without cancellation', () => {
  it('never offer Cancel, even while they could otherwise be cancelled', () => {
    expect(orderService.formatOrder(order()).canCancel).toBe(true);
    const formatted = orderService.formatOrder(order({ cancellationAllowed: false }));
    expect(formatted.canCancel).toBe(false);
    expect(formatted.cancellationAllowed).toBe(false);
  });

  it('are refused by the server with the reason, and nothing is written', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue(order({ cancellationAllowed: false }) as any);
    const request = vi.spyOn(orderRepository, 'requestCancellation');

    await expect(orderService.requestCancellation('o1', 'u1', 'Changed my mind')).rejects.toThrow(NO_CANCELLATION_MESSAGE);
    expect(request).not.toHaveBeenCalled();
  });

  it('keep orders bought before the setting existed cancellable', () => {
    const { cancellationAllowed: _ignored, ...older } = order();
    expect(orderService.formatOrder(older).canCancel).toBe(true);
  });
});

describe('invoice wording', () => {
  it('adds the no-cancellation note only to orders bought without cancellation', () => {
    expect(invoice(false)).toContain(NO_CANCELLATION_INVOICE_NOTE);
    expect(invoice(true)).not.toContain(NO_CANCELLATION_INVOICE_NOTE);
    expect(invoice(undefined)).not.toContain(NO_CANCELLATION_INVOICE_NOTE);
  });

  it('no longer promises "zero refunds"', () => {
    expect(invoice(true)).not.toMatch(/zero refunds/i);
    expect(invoice(false)).not.toMatch(/zero refunds/i);
  });
});

describe('admin status changes on orders placed while cancellation was off', () => {
  const updated = { id: 'o1', createdAt: new Date(), shippingAddress: {}, items: [], status: 'CANCELLED', total: 1 };

  it.each(['CANCELLATION_REQUESTED', 'CANCELLATION_APPROVED'])('refuses %s, which only follows a customer request', async (status) => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue(order({ cancellationAllowed: false }) as any);
    const save = vi.spyOn(adminRepository, 'updateOrderStatus');

    await expect(adminService.updateOrderStatus('o1', { status } as any, 'admin-1')).rejects.toThrow('set it to Cancelled');
    expect(save).not.toHaveBeenCalled();
  });

  it('still lets an admin force-cancel it', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue(order({ cancellationAllowed: false }) as any);
    const save = vi.spyOn(adminRepository, 'updateOrderStatus').mockResolvedValue(updated as any);

    await adminService.updateOrderStatus('o1', { status: 'CANCELLED', note: 'Out of stock.' } as any, 'admin-1');
    expect(save).toHaveBeenCalledWith('o1', 'CANCELLED', null, { fromStatus: 'PAID', adminId: 'admin-1', note: 'Out of stock.' });
  });

  it('leaves orders placed while cancellation was on unchanged', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue(order() as any);
    const save = vi.spyOn(adminRepository, 'updateOrderStatus').mockResolvedValue(updated as any);

    await adminService.updateOrderStatus('o1', { status: 'CANCELLATION_APPROVED' } as any, 'admin-1');
    expect(save).toHaveBeenCalled();
  });
});

describe('the store’s reason for cancelling', () => {
  const updated = { id: 'o1', createdAt: new Date(), shippingAddress: {}, items: [], status: 'CANCELLED', total: 1 };

  it('is required when the store cancels an order the customer didn’t ask to cancel', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue(order() as any);
    const save = vi.spyOn(adminRepository, 'updateOrderStatus');
    await expect(adminService.updateOrderStatus('o1', { status: 'CANCELLED' } as any, 'admin-1')).rejects.toThrow('Give a reason');
    expect(save).not.toHaveBeenCalled();
  });

  it('is optional when finishing a cancellation the customer asked for', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue(order({ status: 'CANCELLATION_APPROVED' }) as any);
    const save = vi.spyOn(adminRepository, 'updateOrderStatus').mockResolvedValue(updated as any);
    await adminService.updateOrderStatus('o1', { status: 'CANCELLED' } as any, 'admin-1');
    expect(save).toHaveBeenCalled();
  });

  it('reaches the customer from the latest cancel by an admin, and only while the order is cancelled', () => {
    const events = [
      { toStatus: 'PAID', actor: 'SYSTEM', note: 'Payment confirmed', createdAt: new Date('2026-11-01') },
      { toStatus: 'CANCELLED', actor: 'ADMIN', note: 'Out of stock.', createdAt: new Date('2026-11-02') },
    ];
    expect(orderService.formatOrder(order({ status: 'CANCELLED', statusEvents: events })).storeCancellationReason).toBe('Out of stock.');
    expect(orderService.formatOrder(order({ status: 'PROCESSING', statusEvents: events })).storeCancellationReason).toBeNull();
  });

  it('is not shown for a cancellation the customer asked for', () => {
    const events = [{ toStatus: 'CANCELLATION_REQUESTED', actor: 'CUSTOMER', note: 'Changed my mind', createdAt: new Date('2026-11-02') }];
    expect(orderService.formatOrder(order({ status: 'CANCELLED', statusEvents: events })).storeCancellationReason).toBeNull();
  });
});
