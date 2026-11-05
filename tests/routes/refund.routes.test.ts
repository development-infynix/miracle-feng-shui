import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getServerSession = vi.hoisted(() => vi.fn());
const refundService = vi.hoisted(() => ({
  requestRefund: vi.fn(),
  approveRefund: vi.fn(),
  checkRefundStatus: vi.fn(),
}));

vi.mock('next-auth', () => ({ getServerSession }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/prisma', () => ({ default: {}, prisma: {} }));
vi.mock('@/server/services/refund.service', () => ({ refundService }));

import { POST as requestRefund } from '@/app/api/orders/[id]/refund/route';
import { POST as approveRefund } from '@/app/api/admin/orders/[id]/refund/route';
import { POST as checkRefund } from '@/app/api/admin/orders/[id]/refund/check/route';

const CUSTOMER = { id: 'c1', name: 'Asha', email: 'asha@example.com', role: 'CUSTOMER' };
const ADMIN = { id: 'a1', name: 'Owner', email: 'owner@example.com', role: 'ADMIN' };
const context = { params: Promise.resolve({ id: 'o1' }) };
const post = (body?: unknown) =>
  new NextRequest('http://localhost/x', { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

beforeEach(() => {
  vi.clearAllMocks();
  refundService.requestRefund.mockResolvedValue({ id: 'o1' });
  refundService.approveRefund.mockResolvedValue({ refund: null });
  refundService.checkRefundStatus.mockResolvedValue({ refund: null });
});

describe('admin refund routes', () => {
  it.each([
    ['approve', () => approveRefund(post({}), context)],
    ['check', () => checkRefund(post({}), context)],
  ])('%s refuses guests and customers', async (_name, call) => {
    getServerSession.mockResolvedValue(null);
    expect((await call()).status).toBe(401);

    getServerSession.mockResolvedValue({ user: CUSTOMER });
    expect((await call()).status).toBe(403);

    expect(refundService.approveRefund).not.toHaveBeenCalled();
    expect(refundService.checkRefundStatus).not.toHaveBeenCalled();
  });

  it('lets the admin approve, and ignores anything sent in the request', async () => {
    getServerSession.mockResolvedValue({ user: ADMIN });
    const res = await approveRefund(post({ amount: 1 }), context);
    expect(res.status).toBe(200);
    expect(refundService.approveRefund).toHaveBeenCalledWith('o1', 'a1');
  });
});

describe('customer refund route', () => {
  it('refuses a guest', async () => {
    getServerSession.mockResolvedValue(null);
    expect((await requestRefund(post(), context)).status).toBe(401);
    expect(refundService.requestRefund).not.toHaveBeenCalled();
  });

  it('only ever asks for a refund for that customer', async () => {
    getServerSession.mockResolvedValue({ user: CUSTOMER });
    expect((await requestRefund(post({ amount: 999999 }), context)).status).toBe(200);
    expect(refundService.requestRefund).toHaveBeenCalledWith('o1', 'c1');
  });
});
