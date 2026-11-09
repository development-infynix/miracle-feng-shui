import { beforeEach, describe, expect, it, vi } from 'vitest';

const razorpayMock = vi.hoisted(() => ({ payments: { refund: vi.fn(), fetchMultipleRefund: vi.fn() } }));
vi.mock('@/lib/razorpay', () => ({ razorpay: razorpayMock }));
vi.mock('@/lib/prisma', () => ({ default: {}, prisma: {} }));

import { refundService } from '@/server/services/refund.service';
import { refundRepository } from '@/server/repositories/refund.repository';
import { orderRepository } from '@/server/repositories/order.repository';
import { orderService } from '@/server/services/order.service';

const ORDER: any = {
  id: 'o1',
  orderNumber: 'MFS-1',
  userId: 'owner',
  status: 'CANCELLATION_APPROVED',
  paymentMethod: 'RAZORPAY',
  paymentStatus: 'PAID',
  razorpayPaymentId: 'pay_1',
  total: 499.5,
  refundRequestedAt: null,
  createdAt: new Date('2026-11-01T00:00:00Z'),
  items: [{ id: 'item1', quantity: 2 }],
  refunds: [],
};
const REFUND: any = {
  id: 'r1',
  orderId: 'o1',
  amountPaise: 49950,
  status: 'REQUESTED',
  razorpayRefundId: null,
  failureReason: null,
  stockReturned: false,
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.restoreAllMocks();
  razorpayMock.payments.refund.mockReset();
  razorpayMock.payments.fetchMultipleRefund.mockReset();
  vi.spyOn(orderRepository, 'findById').mockResolvedValue(ORDER);
  vi.spyOn(refundRepository, 'findLatestForOrder').mockResolvedValue(REFUND);
  vi.spyOn(refundRepository, 'findOpenForOrder').mockResolvedValue(REFUND);
  vi.spyOn(refundRepository, 'claimForApproval').mockResolvedValue(true);
  vi.spyOn(refundRepository, 'applyRazorpayState').mockResolvedValue(undefined);
  vi.spyOn(refundRepository, 'markFailed').mockResolvedValue(undefined);
});

describe('requesting a refund', () => {
  it("hides someone else's order", async () => {
    const create = vi.spyOn(refundRepository, 'createRequest').mockResolvedValue(true);
    await expect(refundService.requestRefund('o1', 'stranger')).rejects.toThrow('Order not found');
    expect(create).not.toHaveBeenCalled();
  });

  it('takes the amount from the order, in whole paise', async () => {
    const create = vi.spyOn(refundRepository, 'createRequest').mockResolvedValue(true);
    await refundService.requestRefund('o1', 'owner');
    expect(create).toHaveBeenCalledWith('o1', 'owner', 49950);
    expect(razorpayMock.payments.refund).not.toHaveBeenCalled();
  });

  it('refuses an order the store cancelled itself, without creating anything', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue({ ...ORDER, status: 'CANCELLED' });
    const create = vi.spyOn(refundRepository, 'createRequest').mockResolvedValue(true);
    await expect(refundService.requestRefund('o1', 'owner')).rejects.toThrow('once your cancellation is approved');
    expect(create).not.toHaveBeenCalled();
  });

  it('refuses when the order is not eligible or was already requested', async () => {
    vi.spyOn(refundRepository, 'createRequest').mockResolvedValue(false);
    await expect(refundService.requestRefund('o1', 'owner')).rejects.toThrow("can't be requested");
  });
});

describe('what the customer is offered', () => {
  const format = (order: object) => orderService.formatOrder({ ...ORDER, ...order });

  it('offers Refund once the customer’s cancellation is approved', () => {
    expect(format({ status: 'CANCELLATION_APPROVED' }).canRequestRefund).toBe(true);
  });

  it('does not offer Refund on an order the store cancelled itself; the store refunds it', () => {
    expect(format({ status: 'CANCELLED' }).canRequestRefund).toBe(false);
  });

  it('tells the customer the refund is being processed after the store cancels a paid order', () => {
    expect(format({ status: 'CANCELLED' }).refundPending).toBe(true);
    expect(format({ status: 'CANCELLED', refunds: [{ ...REFUND, status: 'PROCESSING' }] }).refundPending).toBe(true);
  });

  it('stops saying so once the refund is done, and never says it for unpaid or other orders', () => {
    expect(format({ status: 'CANCELLED', refunds: [{ ...REFUND, status: 'PROCESSED' }] }).refundPending).toBe(false);
    expect(format({ status: 'CANCELLED', paymentStatus: 'PENDING' }).refundPending).toBe(false);
    expect(format({ status: 'CANCELLATION_APPROVED' }).refundPending).toBe(false);
    expect(format({ status: 'SHIPPED' }).refundPending).toBe(false);
  });

  it.each([
    ['still processing', { status: 'PROCESSING' }],
    ['waiting for approval', { status: 'CANCELLATION_REQUESTED' }],
    ['unpaid', { paymentStatus: 'PENDING' }],
    ['pay on delivery', { paymentMethod: 'COD', razorpayPaymentId: null }],
    ['already requested', { refundRequestedAt: new Date() }],
    ['already refunded', { paymentStatus: 'REFUNDED' }],
  ])('offers no Refund when %s', (_name, order) => {
    expect(format(order).canRequestRefund).toBe(false);
  });

  it('shows a failed attempt as still requested, and hides the reason', () => {
    const order = format({ refunds: [{ ...REFUND, status: 'FAILED', failureReason: 'Low balance' }] });
    expect(order.refund).toEqual({ status: 'REQUESTED', amount: 499.5 });
    expect(JSON.stringify(order)).not.toContain('Low balance');
  });
});

describe('refunding an order the store cancelled itself', () => {
  it('creates the refund from the order total and sends it, with no customer request', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue({ ...ORDER, status: 'CANCELLED' });
    vi.spyOn(refundRepository, 'findOpenForOrder').mockResolvedValueOnce(null).mockResolvedValueOnce(REFUND);
    const create = vi.spyOn(refundRepository, 'createRequest').mockResolvedValue(true);
    razorpayMock.payments.refund.mockResolvedValue({ id: 'rfnd_1', status: 'pending' });

    await refundService.approveRefund('o1', 'admin');

    expect(create).toHaveBeenCalledWith('o1', null, 49950, ['CANCELLED']);
    expect(razorpayMock.payments.refund).toHaveBeenCalledWith('pay_1', expect.objectContaining({ amount: 49950 }));
  });

  it('does not start one for an approved cancellation the customer hasn’t asked a refund for', async () => {
    vi.spyOn(refundRepository, 'findOpenForOrder').mockResolvedValue(null);
    const create = vi.spyOn(refundRepository, 'createRequest');
    await expect(refundService.approveRefund('o1', 'admin')).rejects.toThrow('no refund waiting');
    expect(create).not.toHaveBeenCalled();
  });
});

describe('approving a refund', () => {
  it('sends the stored amount to the original payment, marked with our refund id', async () => {
    razorpayMock.payments.refund.mockResolvedValue({ id: 'rfnd_1', status: 'pending' });
    await refundService.approveRefund('o1', 'admin');

    expect(razorpayMock.payments.refund).toHaveBeenCalledWith('pay_1', {
      amount: 49950,
      speed: 'normal',
      notes: { refundId: 'r1', orderNumber: 'MFS-1' },
    });
    expect(refundRepository.claimForApproval).toHaveBeenCalledWith('r1', 'admin');
    expect(refundRepository.applyRazorpayState).toHaveBeenCalledWith('r1', 'pending', 'rfnd_1');
  });

  it('never calls Razorpay when another approval won', async () => {
    vi.spyOn(refundRepository, 'claimForApproval').mockResolvedValue(false);
    await expect(refundService.approveRefund('o1', 'admin')).rejects.toThrow('already being processed');
    expect(razorpayMock.payments.refund).not.toHaveBeenCalled();
  });

  it.each([
    ['the order moved on', { status: 'SHIPPED' }, 'Only a cancelled order'],
    ['nothing was paid', { paymentStatus: 'PENDING' }, 'no online payment'],
    ['there is no payment id', { razorpayPaymentId: null }, 'no online payment'],
  ])('refuses when %s', async (_name, order, message) => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue({ ...ORDER, ...order });
    await expect(refundService.approveRefund('o1', 'admin')).rejects.toThrow(message);
    expect(razorpayMock.payments.refund).not.toHaveBeenCalled();
  });

  it('marks it failed when Razorpay refuses', async () => {
    razorpayMock.payments.refund.mockRejectedValue({ statusCode: 400, error: { description: 'Insufficient balance' } });
    await refundService.approveRefund('o1', 'admin');
    expect(refundRepository.markFailed).toHaveBeenCalledWith('r1', 'Insufficient balance');
  });

  it("doesn't mark it failed after a timeout, because the money may have moved", async () => {
    razorpayMock.payments.refund.mockRejectedValue(new Error('socket hang up'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await refundService.approveRefund('o1', 'admin');
    expect(refundRepository.markFailed).not.toHaveBeenCalled();
    expect(result.notice).toContain('Check the status');
  });
});

describe('checking a refund with Razorpay', () => {
  beforeEach(() => {
    vi.spyOn(refundRepository, 'findProcessingForOrder').mockResolvedValue({ ...REFUND, status: 'PROCESSING' });
  });

  it('finds a refund by our id after a lost response', async () => {
    razorpayMock.payments.fetchMultipleRefund.mockResolvedValue({
      items: [{ id: 'rfnd_other', status: 'processed', notes: {} }, { id: 'rfnd_1', status: 'processed', notes: { refundId: 'r1' } }],
    });
    await refundService.checkRefundStatus('o1');
    expect(refundRepository.applyRazorpayState).toHaveBeenCalledWith('r1', 'processed', 'rfnd_1', undefined);
  });

  it("waits before deciding a very recent refund doesn't exist", async () => {
    razorpayMock.payments.fetchMultipleRefund.mockResolvedValue({ items: [] });
    await refundService.checkRefundStatus('o1');
    expect(refundRepository.markFailed).not.toHaveBeenCalled();
  });

  it('frees it for a retry once Razorpay clearly has no record', async () => {
    vi.spyOn(refundRepository, 'findProcessingForOrder').mockResolvedValue({
      ...REFUND,
      status: 'PROCESSING',
      updatedAt: new Date(Date.now() - 10 * 60 * 1000),
    });
    razorpayMock.payments.fetchMultipleRefund.mockResolvedValue({ items: [] });
    await refundService.checkRefundStatus('o1');
    expect(refundRepository.markFailed).toHaveBeenCalled();
  });
});

describe('refund webhooks', () => {
  const entity = { id: 'rfnd_1', payment_id: 'pay_1', amount: 49950, notes: { refundId: 'r1' } };

  beforeEach(() => {
    vi.spyOn(orderRepository, 'findByRazorpayPaymentId').mockResolvedValue(ORDER);
    vi.spyOn(refundRepository, 'findByRazorpayId').mockResolvedValue(null);
    vi.spyOn(refundRepository, 'findById').mockResolvedValue(REFUND);
    vi.spyOn(refundRepository, 'createFromRazorpay').mockResolvedValue({ ...REFUND, id: 'dash' });
  });

  it.each([
    ['refund.created', 'pending'],
    ['refund.processed', 'processed'],
    ['refund.failed', 'failed'],
  ])('%s updates our refund', async (event, state) => {
    await refundService.handleWebhook(event, entity);
    expect(refundRepository.applyRazorpayState).toHaveBeenCalledWith('r1', state, 'rfnd_1', undefined);
    expect(refundRepository.createFromRazorpay).not.toHaveBeenCalled();
  });

  it('records a refund made in the Razorpay dashboard', async () => {
    await refundService.handleWebhook('refund.processed', { id: 'rfnd_d', payment_id: 'pay_1', amount: 100 });
    expect(refundRepository.createFromRazorpay).toHaveBeenCalledWith('o1', 'rfnd_d', 100);
    expect(refundRepository.applyRazorpayState).toHaveBeenCalledWith('dash', 'processed', 'rfnd_d', undefined);
  });

  it('ignores a refund for a payment the store never took', async () => {
    vi.spyOn(orderRepository, 'findByRazorpayPaymentId').mockResolvedValue(null);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await refundService.handleWebhook('refund.processed', entity);
    expect(refundRepository.applyRazorpayState).not.toHaveBeenCalled();
  });

  it("ignores a refund id that belongs to another order", async () => {
    vi.spyOn(refundRepository, 'findById').mockResolvedValue({ ...REFUND, orderId: 'other' });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await refundService.handleWebhook('refund.processed', entity);
    expect(refundRepository.applyRazorpayState).not.toHaveBeenCalled();
  });

  it('ignores other refund events', async () => {
    await refundService.handleWebhook('refund.speed_changed', entity);
    expect(refundRepository.applyRazorpayState).not.toHaveBeenCalled();
  });
});
