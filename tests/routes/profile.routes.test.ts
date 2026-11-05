import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

const getServerSession = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  address: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  favorite: { findMany: vi.fn(), count: vi.fn() },
  $transaction: vi.fn((run: (tx: unknown) => unknown) => run(db)),
}));

vi.mock('next-auth', () => ({ getServerSession }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/prisma', () => ({ default: db, prisma: db }));

import { PATCH as patchProfile } from '@/app/api/auth/profile/route';
import { POST as verifyPassword } from '@/app/api/auth/verify-password/route';
import { POST as changePassword } from '@/app/api/auth/change-password/route';
import { GET as getFavorites } from '@/app/api/favorites/route';
import { POST as createAddress } from '@/app/api/addresses/route';
import { DELETE as deleteAddress, PATCH as patchAddress } from '@/app/api/addresses/[id]/route';
import { orderService } from '@/server/services/order.service';

const CUSTOMER = { id: 'u1', name: 'Asha', email: 'asha@example.com', role: 'CUSTOMER' };

const request = (url: string, method: string, body?: unknown) =>
  new NextRequest(`http://localhost${url}`, {
    method,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
  getServerSession.mockResolvedValue({ user: CUSTOMER });
});

describe('editing the profile', () => {
  beforeEach(() => {
    db.user.update.mockResolvedValue({ id: 'u1', name: 'Asha Rao', email: 'asha@example.com', phone: '9999999999' });
  });

  it('changes the name and phone, and ignores any email sent', async () => {
    const res = await patchProfile(request('/api/auth/profile', 'PATCH', { name: ' Asha Rao ', phone: '9999999999', email: 'new@example.com', role: 'ADMIN' }));

    expect(res.status).toBe(200);
    expect(db.user.update.mock.calls[0][0].data).toEqual({ name: 'Asha Rao', phone: '9999999999' });
  });

  it('clears the phone when it is emptied', async () => {
    await patchProfile(request('/api/auth/profile', 'PATCH', { name: 'Asha', phone: '' }));
    expect(db.user.update.mock.calls[0][0].data.phone).toBeNull();
  });

  it.each([[{ name: ' ' }], [{ name: 'A' }], [{ name: 'Asha', phone: 'abc' }]])('rejects %j', async (body) => {
    const res = await patchProfile(request('/api/auth/profile', 'PATCH', body));
    expect(res.status).toBe(400);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('requires a login', async () => {
    getServerSession.mockResolvedValue(null);
    const res = await patchProfile(request('/api/auth/profile', 'PATCH', { name: 'Asha' }));
    expect(res.status).toBe(401);
  });
});

describe('changing the password', () => {
  const stored = bcrypt.hashSync('current-pass', 4);

  beforeEach(() => {
    db.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: stored });
    db.user.update.mockResolvedValue({ id: 'u1' });
  });

  it('verifies the right password', async () => {
    const res = await verifyPassword(request('/api/auth/verify-password', 'POST', { currentPassword: 'current-pass' }));
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual({ verified: true });
  });

  it('refuses the wrong password', async () => {
    const res = await verifyPassword(request('/api/auth/verify-password', 'POST', { currentPassword: 'wrong' }));
    expect(res.status).toBe(400);
  });

  it('refuses a guest', async () => {
    getServerSession.mockResolvedValue(null);
    const res = await verifyPassword(request('/api/auth/verify-password', 'POST', { currentPassword: 'current-pass' }));
    expect(res.status).toBe(401);
  });

  it('checks the current password again when saving, whatever was verified before', async () => {
    const res = await changePassword(request('/api/auth/change-password', 'POST', { currentPassword: 'wrong', newPassword: 'brand-new-pass' }));
    expect(res.status).toBe(400);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('needs the current password to be sent at all', async () => {
    const res = await changePassword(request('/api/auth/change-password', 'POST', { newPassword: 'brand-new-pass' }));
    expect(res.status).toBe(400);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('saves a hash of the new password', async () => {
    const res = await changePassword(request('/api/auth/change-password', 'POST', { currentPassword: 'current-pass', newPassword: ' brand-new-pass ' }));
    expect(res.status).toBe(200);
    const saved = db.user.update.mock.calls[0][0].data.passwordHash;
    expect(saved).not.toContain('brand-new-pass');
    expect(await bcrypt.compare('brand-new-pass', saved)).toBe(true);
  });

  it.each([['short'], ['current-pass']])('refuses %s as the new password', async (newPassword) => {
    const res = await changePassword(request('/api/auth/change-password', 'POST', { currentPassword: 'current-pass', newPassword }));
    expect(res.status).toBe(400);
    expect(db.user.update).not.toHaveBeenCalled();
  });
});

describe('favorites paging', () => {
  const favorite = (id: string) => ({
    product: { id, title: id, price: 100, images: ['a.jpg', 'b.jpg'], stock: 5, category: { name: 'Bells' }, description: 'Long text' },
  });

  it('returns a page of card fields, and says when there is more', async () => {
    db.favorite.findMany.mockResolvedValue([favorite('p1'), favorite('p2')]);
    db.favorite.count.mockResolvedValue(17);

    const res = await getFavorites(request('/api/favorites?skip=0&take=15', 'GET'));
    const { data } = await res.json();

    expect(db.favorite.findMany.mock.calls[0][0]).toMatchObject({ skip: 0, take: 15 });
    expect(data).toMatchObject({ total: 17, hasMore: true });
    expect(data.items[0].images).toEqual(['a.jpg']);
    expect(data.items[0]).not.toHaveProperty('description');
  });

  it('says when it has reached the end', async () => {
    db.favorite.findMany.mockResolvedValue([favorite('p16'), favorite('p17')]);
    db.favorite.count.mockResolvedValue(17);

    const { data } = await (await getFavorites(request('/api/favorites?skip=15&take=15', 'GET'))).json();

    expect(data.hasMore).toBe(false);
  });

  it('still returns the full list without paging, which the hearts rely on', async () => {
    db.favorite.findMany.mockResolvedValue([favorite('p1')]);

    const { data } = await (await getFavorites(request('/api/favorites', 'GET'))).json();

    expect(Array.isArray(data)).toBe(true);
    expect(db.favorite.count).not.toHaveBeenCalled();
  });
});

describe('order tracking', () => {
  const order = { id: 'o1', orderNumber: 'MFS-1', status: 'SHIPPED', total: 100, createdAt: new Date(), items: [] };

  it('is empty until a real tracking number is recorded', () => {
    expect(orderService.formatOrder(order).tracking).toBeNull();
  });

  it('shows what was recorded', () => {
    const tracked = orderService.formatOrder({ ...order, courier: 'DTDC', trackingNumber: 'D123' });
    expect(tracked.tracking).toEqual({ courier: 'DTDC', number: 'D123' });
  });
});

describe('addresses', () => {
  const body = { name: 'Asha', phone: '9999999999', line1: '12 Lotus Road', city: 'Kochi', state: 'Kerala', pincode: '682001', type: 'Office' };

  beforeEach(() => {
    db.address.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'a1', ...data }));
  });

  it("makes a customer's first address primary, and keeps its type", async () => {
    db.address.count.mockResolvedValue(0);

    await createAddress(request('/api/addresses', 'POST', body));

    expect(db.address.create.mock.calls[0][0].data).toMatchObject({ userId: 'u1', isDefault: true, type: 'Office' });
  });

  it('leaves the primary alone when adding another', async () => {
    db.address.count.mockResolvedValue(2);

    await createAddress(request('/api/addresses', 'POST', body));

    expect(db.address.create.mock.calls[0][0].data.isDefault).toBe(false);
    expect(db.address.updateMany).not.toHaveBeenCalled();
  });

  it('promotes the newest remaining address when the primary is deleted', async () => {
    db.address.findUnique.mockResolvedValue({ id: 'a1', userId: 'u1', isDefault: true });
    db.address.findMany.mockResolvedValue([{ id: 'a2' }]);

    const res = await deleteAddress(request('/api/addresses/a1', 'DELETE'), params('a1'));

    expect(res.status).toBe(200);
    expect(db.address.updateMany).toHaveBeenCalledWith({ where: { id: 'a2', userId: 'u1' }, data: { isDefault: true } });
  });

  it("can't touch another customer's address", async () => {
    db.address.findUnique.mockResolvedValue({ id: 'a9', userId: 'someone-else', isDefault: false });

    expect((await deleteAddress(request('/api/addresses/a9', 'DELETE'), params('a9'))).status).toBe(404);
    expect((await patchAddress(request('/api/addresses/a9', 'PATCH', { city: 'X' }), params('a9'))).status).toBe(404);
    expect(db.address.deleteMany).not.toHaveBeenCalled();
    expect(db.address.updateMany).not.toHaveBeenCalled();
  });

  it('changes only what was sent, without resetting other fields', async () => {
    db.address.findUnique.mockResolvedValue({ id: 'a1', userId: 'u1', isDefault: false, country: 'United Arab Emirates', type: 'Office' });

    await patchAddress(request('/api/addresses/a1', 'PATCH', { city: 'Dubai' }), params('a1'));

    expect(db.address.updateMany.mock.calls[0][0].data).toEqual({ city: 'Dubai' });
  });

  it("can't leave a customer with no primary address", async () => {
    db.address.findUnique.mockResolvedValue({ id: 'a1', userId: 'u1', isDefault: true });

    await patchAddress(request('/api/addresses/a1', 'PATCH', { isDefault: false }), params('a1'));

    expect(db.address.updateMany.mock.calls.at(-1)?.[0].data.isDefault).toBe(true);
  });
});
