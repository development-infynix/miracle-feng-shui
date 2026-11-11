import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({ default: {}, prisma: {} }));

import { notificationService, orderChangeNotice, refundNotice, reviewNotice, type OrderChange } from '@/server/services/notification.service';
import { notificationRepository } from '@/server/repositories/notification.repository';

const change = (from: OrderChange['from'], to: OrderChange['to'], extra: Partial<OrderChange> = {}) =>
  orderChangeNotice({ orderNumber: 'MFS-AB12', from, to, paidOnline: true, ...extra });

describe('order notices', () => {
  it('tells the customer when it ships, with real tracking only', () => {
    expect(change('PROCESSING', 'SHIPPED')).toMatchObject({ kind: 'ORDER', title: 'Order MFS-AB12 has shipped', body: "It's on its way to you." });
    expect(change('PROCESSING', 'SHIPPED', { courier: 'DTDC', trackingNumber: 'D123' })?.body).toContain('DTDC D123');
  });

  it('tells the customer when it is delivered', () => {
    expect(change('SHIPPED', 'DELIVERED')?.title).toBe('Order MFS-AB12 was delivered');
  });

  it('gives the reason when the store cancels, and mentions the refund only for online payments', () => {
    expect(change('PAID', 'CANCELLED', { note: 'Out of stock' })?.body).toBe("Reason: Out of stock We'll refund your payment.");
    expect(change('COD_PENDING', 'CANCELLED', { note: 'Out of stock', paidOnline: false })?.body).toBe('Reason: Out of stock');
  });

  it("answers the customer's own cancellation request", () => {
    expect(change('CANCELLATION_REQUESTED', 'CANCELLATION_APPROVED')?.body).toContain('ask for your refund');
    expect(change('CANCELLATION_REQUESTED', 'CANCELLATION_APPROVED', { paidOnline: false })?.body).toBe('Order MFS-AB12 is cancelled.');
    expect(change('CANCELLATION_REQUESTED', 'PROCESSING', { note: 'Already packed' })).toMatchObject({
      title: 'Your cancellation request was declined',
      body: 'Order MFS-AB12: Already packed',
    });
  });

  it("stays quiet for steps the customer doesn't need to hear about", () => {
    expect(change('PAID', 'PROCESSING')).toBeNull();
    expect(change('SHIPPED', 'SHIPPED')).toBeNull();
    // They asked for it, so the request itself and finishing their approved cancellation say nothing.
    expect(change('PAID', 'CANCELLATION_REQUESTED')).toBeNull();
    expect(change('CANCELLATION_APPROVED', 'CANCELLED')).toBeNull();
  });
});

describe('review and refund notices', () => {
  it('says why a review was taken down and links to the product', () => {
    expect(reviewNotice('Wealth Bowl', 'p1', { kind: 'hidden', because: 'it shared personal details' })).toEqual({
      kind: 'REVIEW',
      title: 'Your review was taken down',
      body: 'Your review of Wealth Bowl was taken down because it shared personal details.',
      link: '/shop?product=p1',
    });
    expect(reviewNotice('Wealth Bowl', 'p1', { kind: 'restored' }).title).toBe('Your review is back');
  });

  it('shows the refunded amount in rupees', () => {
    expect(refundNotice('MFS-AB12', 49950).body).toContain('₹499.50');
  });
});

describe('notify', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('saves the notice for the customer', () => {
    const create = vi.spyOn(notificationRepository, 'create').mockResolvedValue({} as any);
    notificationService.notify('u1', { kind: 'ORDER', title: 't', body: 'b' });
    expect(create).toHaveBeenCalledWith('u1', { kind: 'ORDER', title: 't', body: 'b' });
  });

  it('skips when there is nothing to say, and never throws when saving fails', async () => {
    const create = vi.spyOn(notificationRepository, 'create').mockRejectedValue(new Error('db down'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    notificationService.notify('u1', null);
    notificationService.notify(null, { kind: 'ORDER', title: 't', body: 'b' });
    expect(create).not.toHaveBeenCalled();
    expect(() => notificationService.notify('u1', { kind: 'ORDER', title: 't', body: 'b' })).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(log).toHaveBeenCalled();
  });
});
