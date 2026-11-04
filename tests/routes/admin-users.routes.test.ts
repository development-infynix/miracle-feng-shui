import { beforeEach, describe, expect, it, vi } from 'vitest';

const getServerSession = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({ user: { findFirst: vi.fn() } }));

vi.mock('next-auth', () => ({ getServerSession }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/prisma', () => ({ default: db }));

import { GET as getProfile } from '@/app/api/admin/users/[id]/route';
import { GET as getFavorites } from '@/app/api/admin/users/[id]/favorites/route';
import { GET as getCart } from '@/app/api/admin/users/[id]/cart/route';
import { GET as getOrders } from '@/app/api/admin/users/[id]/orders/route';

const routes = [
  ['profile', getProfile],
  ['favorites', getFavorites],
  ['cart', getCart],
  ['orders', getOrders],
] as const;

const call = (handler: (typeof routes)[number][1]) =>
  handler({} as any, { params: Promise.resolve({ id: 'user-1' }) });

const FORBIDDEN_FIELDS = ['passwordHash', 'resetToken', 'shippingAddress', 'razorpay'];

describe.each(routes)('GET /api/admin/users/[id] %s', (_name, handler) => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ALLOW_DEV_ADMIN;
  });

  it('rejects a signed-out request without querying', async () => {
    getServerSession.mockResolvedValue(null);

    const res = await call(handler);

    expect(res.status).toBe(401);
    expect(db.user.findFirst).not.toHaveBeenCalled();
  });

  it('rejects a customer session without querying', async () => {
    getServerSession.mockResolvedValue({ user: { id: 'c1', role: 'CUSTOMER' } });

    const res = await call(handler);

    expect(res.status).toBe(403);
    expect(db.user.findFirst).not.toHaveBeenCalled();
  });

  it('returns 404 unless the id belongs to a customer', async () => {
    getServerSession.mockResolvedValue({ user: { id: 'a1', role: 'ADMIN' } });
    db.user.findFirst.mockResolvedValue(null);

    const res = await call(handler);

    expect(res.status).toBe(404);
    expect(db.user.findFirst.mock.calls[0][0].where).toEqual({ id: 'user-1', role: 'CUSTOMER' });
  });

  it('never asks the database for sensitive fields', async () => {
    getServerSession.mockResolvedValue({ user: { id: 'a1', role: 'ADMIN' } });
    db.user.findFirst.mockResolvedValue({ favorites: [], cart: null, orders: [] });

    await call(handler);

    const query = JSON.stringify(db.user.findFirst.mock.calls[0][0]);
    for (const field of FORBIDDEN_FIELDS) expect(query).not.toContain(field);
    expect(db.user.findFirst.mock.calls[0][0].include).toBeUndefined();
  });
});
