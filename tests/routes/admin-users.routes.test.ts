import { beforeEach, describe, expect, it, vi } from 'vitest';

const getServerSession = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  user: { findFirst: vi.fn() },
  cartItem: { findMany: vi.fn() },
  order: { aggregate: vi.fn() },
}));

vi.mock('next-auth', () => ({ getServerSession }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/prisma', () => ({ default: db }));

import { GET as getProfile } from '@/app/api/admin/users/[id]/route';
import { GET as getFavorites } from '@/app/api/admin/users/[id]/favorites/route';
import { GET as getCart } from '@/app/api/admin/users/[id]/cart/route';
import { GET as getOrders } from '@/app/api/admin/users/[id]/orders/route';

type Handler = typeof getFavorites;

const routes = [
  ['profile', getProfile],
  ['favorites', getFavorites],
  ['cart', getCart],
  ['orders', getOrders],
] as const;

const call = (handler: Handler, query = '') =>
  handler(new Request(`http://localhost/api/admin/users/user-1${query}`) as any, {
    params: Promise.resolve({ id: 'user-1' }),
  });

const asAdmin = () => getServerSession.mockResolvedValue({ user: { id: 'a1', role: 'ADMIN' } });

const FORBIDDEN_FIELDS = ['passwordHash', 'resetToken', 'shippingAddress', 'razorpay'];

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.ALLOW_DEV_ADMIN;
  db.cartItem.findMany.mockResolvedValue([]);
  db.order.aggregate.mockResolvedValue({ _sum: { total: null } });
});

describe.each(routes)('GET /api/admin/users/[id] %s', (_name, handler) => {
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
    asAdmin();
    db.user.findFirst.mockResolvedValue(null);

    const res = await call(handler);

    expect(res.status).toBe(404);
    expect(db.user.findFirst.mock.calls[0][0].where).toEqual({ id: 'user-1', role: 'CUSTOMER' });
  });

  it('never asks the database for sensitive fields', async () => {
    asAdmin();
    db.user.findFirst.mockResolvedValue({
      favorites: [],
      cart: null,
      orders: [],
      _count: { favorites: 0, orders: 0 },
    });

    await call(handler);

    const query = JSON.stringify(db.user.findFirst.mock.calls[0][0]);
    for (const field of FORBIDDEN_FIELDS) expect(query).not.toContain(field);
    expect(db.user.findFirst.mock.calls[0][0].include).toBeUndefined();
  });
});

describe('customer list paging', () => {
  beforeEach(asAdmin);

  it.each([
    ['favorites', getFavorites, (select: any) => select.favorites],
    ['cart', getCart, (select: any) => select.cart.select.items],
    ['orders', getOrders, (select: any) => select.orders],
  ] as const)('%s fetches 20 rows per page in a stable order', async (_name, handler, relation) => {
    db.user.findFirst.mockResolvedValue({
      favorites: [],
      cart: null,
      orders: [],
      _count: { favorites: 0, orders: 0 },
    });

    await call(handler);
    await call(handler, '?page=3');

    const first = relation(db.user.findFirst.mock.calls[0][0].select);
    const third = relation(db.user.findFirst.mock.calls[1][0].select);
    expect(first).toMatchObject({ skip: 0, take: 20 });
    expect(third).toMatchObject({ skip: 40, take: 20 });
    expect(first.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
  });

  it.each([
    [20, 1, false],
    [21, 1, true],
    [40, 2, false],
    [41, 2, true],
  ])('with %i favorites, page %i has hasMore=%s', async (total, page, hasMore) => {
    db.user.findFirst.mockResolvedValue({ favorites: [], _count: { favorites: total } });

    const res = await call(getFavorites, `?page=${page}`);

    expect((await res.json()).data).toMatchObject({ total, page, hasMore });
  });

  it.each(['0', '-1', '1.5', 'abc', 'Infinity', '1e30'])('rejects page=%s', async (page) => {
    const res = await call(getOrders, `?page=${page}`);

    expect(res.status).toBe(400);
    expect(db.user.findFirst).not.toHaveBeenCalled();
  });

  it('computes cart totals from every line, not just the loaded page', async () => {
    db.user.findFirst.mockResolvedValue({
      cart: {
        items: [{ id: 'i1', quantity: 1, product: { price: 100 } }],
        _count: { items: 25 },
      },
    });
    db.cartItem.findMany.mockResolvedValue([
      { quantity: 1, product: { price: 100 } },
      { quantity: 3, product: { price: 50 } },
    ]);

    const { data } = await (await call(getCart)).json();

    expect(data).toMatchObject({ total: 25, hasMore: true, quantity: 4, subtotal: 250 });
    expect(db.cartItem.findMany.mock.calls[0][0].take).toBeUndefined();
  });

  it('treats a customer with no cart as an empty list', async () => {
    db.user.findFirst.mockResolvedValue({ cart: null });

    const { data } = await (await call(getCart)).json();

    expect(data).toEqual({ items: [], total: 0, page: 1, hasMore: false, quantity: 0, subtotal: 0 });
  });

  it('computes the orders total from all orders, not just the loaded page', async () => {
    db.user.findFirst.mockResolvedValue({ orders: [{ id: 'o1', total: 10 }], _count: { orders: 30 } });
    db.order.aggregate.mockResolvedValue({ _sum: { total: 3000 } });

    const { data } = await (await call(getOrders)).json();

    expect(data).toMatchObject({ total: 30, hasMore: true, totalAmount: 3000 });
    expect(db.order.aggregate.mock.calls[0][0].where).toEqual({ userId: 'user-1' });
  });
});
