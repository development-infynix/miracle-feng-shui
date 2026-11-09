import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getServerSession = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => {
  const client: any = {
    order: { findUnique: vi.fn(), updateMany: vi.fn() },
    orderStatusEvent: { create: vi.fn() },
  };
  // The request and its history entry are written in one transaction.
  client.$transaction = vi.fn((work: (tx: unknown) => unknown) => work(client));
  return client;
});

vi.mock('next-auth', () => ({ getServerSession }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/prisma', () => ({ default: db, prisma: db }));

import { POST } from '@/app/api/orders/[id]/cancel/route';
import { orderService } from '@/server/services/order.service';
import { updateOrderStatusSchema } from '@/server/validators/admin.validator';

const OWNER = { id: 'owner', name: 'Asha', email: 'asha@example.com', role: 'CUSTOMER' };
const STRANGER = { id: 'stranger', name: 'Sam', email: 'sam@example.com', role: 'CUSTOMER' };

const ORDER = {
  id: 'o1',
  orderNumber: 'MFS-123456',
  userId: 'owner',
  status: 'PAID',
  paymentMethod: 'RAZORPAY',
  paymentStatus: 'PAID',
  total: 500,
  cancellationRequestedAt: null,
  createdAt: new Date('2026-11-01T00:00:00Z'),
  items: [],
};

const context = { params: Promise.resolve({ id: 'o1' }) };
const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/orders/o1/cancel', { method: 'POST', body: JSON.stringify(body) }),
    context
  );

beforeEach(() => {
  vi.clearAllMocks();
  getServerSession.mockResolvedValue({ user: OWNER });
  db.order.findUnique.mockResolvedValue(ORDER);
  db.order.updateMany.mockResolvedValue({ count: 1 });
});

describe('POST /api/orders/[id]/cancel', () => {
  it('refuses a guest', async () => {
    getServerSession.mockResolvedValue(null);
    expect((await post({ reason: 'Wrong item' })).status).toBe(401);
    expect(db.order.updateMany).not.toHaveBeenCalled();
  });

  it("hides someone else's order", async () => {
    getServerSession.mockResolvedValue({ user: STRANGER });
    expect((await post({ reason: 'Wrong item' })).status).toBe(404);
    expect(db.order.updateMany).not.toHaveBeenCalled();
  });

  it('needs a reason', async () => {
    expect((await post({ reason: '   ' })).status).toBe(400);
    expect((await post({})).status).toBe(400);
    expect(db.order.updateMany).not.toHaveBeenCalled();
  });

  it('records the request and its trimmed reason', async () => {
    db.order.findUnique
      .mockResolvedValueOnce(ORDER) // the ownership check
      .mockResolvedValueOnce(ORDER) // the status read inside the transaction
      .mockResolvedValueOnce({ ...ORDER, status: 'CANCELLATION_REQUESTED', cancellationRequestedAt: new Date() });

    const res = await post({ reason: '  Wrong item  ' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe('CANCELLATION_REQUESTED');
    expect(json.data.canCancel).toBe(false);
    expect(json.data.cancellationDeclined).toBe(false);

    const { where, data } = db.order.updateMany.mock.calls[0][0];
    expect(where).toMatchObject({ id: 'o1', userId: 'owner', cancellationRequestedAt: null });
    expect(where.OR[0].status.in).not.toContain('SHIPPED');
    expect(data).toMatchObject({ status: 'CANCELLATION_REQUESTED', cancellationReason: 'Wrong item' });
    expect(where.status).toBe('PAID');
    expect(db.orderStatusEvent.create).toHaveBeenCalledWith({
      data: { orderId: 'o1', fromStatus: 'PAID', toStatus: 'CANCELLATION_REQUESTED', actor: 'CUSTOMER', changedById: 'owner', note: 'Wrong item' },
    });
  });

  it('refuses an order that can no longer be cancelled', async () => {
    db.order.updateMany.mockResolvedValue({ count: 0 });
    expect((await post({ reason: 'Wrong item' })).status).toBe(409);
    expect(db.orderStatusEvent.create).not.toHaveBeenCalled();
  });
});

describe('what the customer is offered', () => {
  const format = (order: object) => orderService.formatOrder({ ...ORDER, ...order });

  it.each([
    ['PAID', 'PAID'],
    ['COD_PENDING', 'PENDING'],
    ['PROCESSING', 'PAID'],
    ['PENDING', 'PAID'],
  ])('offers Cancel on %s', (status, paymentStatus) => {
    expect(format({ status, paymentStatus }).canCancel).toBe(true);
  });

  it.each([
    ['PENDING', 'PENDING'],
    ['SHIPPED', 'PAID'],
    ['DELIVERED', 'PAID'],
    ['CANCELLATION_REQUESTED', 'PAID'],
    ['CANCELLATION_APPROVED', 'PAID'],
    ['CANCELLED', 'PAID'],
  ])('offers no Cancel on %s', (status, paymentStatus) => {
    expect(format({ status, paymentStatus }).canCancel).toBe(false);
  });

  it('allows one request per order, and says when it was turned down', () => {
    const order = format({ status: 'PROCESSING', cancellationRequestedAt: new Date() });
    expect(order.canCancel).toBe(false);
    expect(order.cancellationDeclined).toBe(true);
  });

  it("doesn't call an approved or admin-cancelled order declined", () => {
    const requestedAt = new Date();
    expect(format({ status: 'CANCELLATION_APPROVED', cancellationRequestedAt: requestedAt }).cancellationDeclined).toBe(false);
    expect(format({ status: 'CANCELLED', cancellationRequestedAt: requestedAt }).cancellationDeclined).toBe(false);
    expect(format({ status: 'CANCELLED' }).cancellationDeclined).toBe(false);
  });
});

describe('admin status names', () => {
  it.each([
    ['Cancellation Requested', 'CANCELLATION_REQUESTED'],
    ['Cancellation Approved', 'CANCELLATION_APPROVED'],
    ['CANCELLATION APPROVED', 'CANCELLATION_APPROVED'],
    ['Cancelled', 'CANCELLED'],
  ])('accepts %s', (status, expected) => {
    expect(updateOrderStatusSchema.parse({ status }).status).toBe(expected);
  });
});
