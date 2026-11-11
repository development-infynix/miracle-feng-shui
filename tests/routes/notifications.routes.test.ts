import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getServerSession = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  notification: { findMany: vi.fn(), count: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
}));

vi.mock('next-auth', () => ({ getServerSession }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/prisma', () => ({ default: db, prisma: db }));

import { GET, DELETE } from '@/app/api/notifications/route';
import { POST as markRead } from '@/app/api/notifications/read/route';

const req = (path: string, init?: ConstructorParameters<typeof NextRequest>[1]) => new NextRequest(`http://localhost${path}`, init);

beforeEach(() => {
  vi.clearAllMocks();
  getServerSession.mockResolvedValue({ user: { id: 'u1', name: 'Asha', role: 'CUSTOMER' } });
  db.notification.findMany.mockResolvedValue([
    { id: 'n1', kind: 'ORDER', title: 'Shipped', body: 'On its way', link: '/profile?tab=orders', readAt: null, createdAt: new Date('2026-11-11T00:00:00Z') },
  ]);
  db.notification.count.mockResolvedValue(1);
  db.notification.updateMany.mockResolvedValue({ count: 1 });
  db.notification.deleteMany.mockResolvedValue({ count: 3 });
});

describe('/api/notifications', () => {
  it('needs a signed-in customer', async () => {
    getServerSession.mockResolvedValue(null);
    expect((await GET(req('/api/notifications'))).status).toBe(401);
    expect((await DELETE(req('/api/notifications', { method: 'DELETE' }))).status).toBe(401);
    expect((await markRead(req('/api/notifications/read', { method: 'POST' }))).status).toBe(401);
    expect(db.notification.findMany).not.toHaveBeenCalled();
  });

  it("lists only the customer's own notifications, with the unread count", async () => {
    const json = await (await GET(req('/api/notifications'))).json();
    expect(json.data).toEqual({
      items: [{ id: 'n1', kind: 'ORDER', title: 'Shipped', body: 'On its way', link: '/profile?tab=orders', read: false, createdAt: '2026-11-11T00:00:00.000Z' }],
      unread: 1,
    });
    expect(db.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'u1' } }));
  });

  it('returns just the count for the header badge', async () => {
    const json = await (await GET(req('/api/notifications?count=1'))).json();
    expect(json.data).toEqual({ unread: 1 });
    expect(db.notification.findMany).not.toHaveBeenCalled();
  });

  it("marks all read, or one, always within the customer's own", async () => {
    await markRead(req('/api/notifications/read', { method: 'POST' }));
    expect(db.notification.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: { userId: 'u1', readAt: null } }));
    await markRead(req('/api/notifications/read', { method: 'POST', body: JSON.stringify({ id: 'n1' }) }));
    expect(db.notification.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: { userId: 'u1', readAt: null, id: 'n1' } }));
  });

  it("clears only the customer's own", async () => {
    const json = await (await DELETE(req('/api/notifications', { method: 'DELETE' }))).json();
    expect(json.data).toEqual({ cleared: 3 });
    expect(db.notification.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });
  });
});
