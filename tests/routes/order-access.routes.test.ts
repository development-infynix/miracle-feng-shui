import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getServerSession = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  order: { findFirst: vi.fn() },
  cart: { findUnique: vi.fn(), create: vi.fn() },
}));

vi.mock('next-auth', () => ({ getServerSession }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/prisma', () => ({ default: db, prisma: db }));

import { GET as getOrder } from '@/app/api/orders/[id]/route';
import { GET as getInvoice } from '@/app/api/orders/[id]/invoice/route';
import { POST as createOrder } from '@/app/api/orders/route';

const OWNER = { id: 'owner', name: 'Asha', email: 'asha@example.com', role: 'CUSTOMER' };
const STRANGER = { id: 'stranger', name: 'Sam', email: 'sam@example.com', role: 'CUSTOMER' };
const ADMIN = { id: 'admin', name: 'Owner', email: 'admin@example.com', role: 'ADMIN' };

const ORDER = {
  id: 'o1',
  orderNumber: 'MFS-123456',
  userId: 'owner',
  status: 'PAID',
  paymentMethod: 'RAZORPAY',
  paymentStatus: 'PAID',
  razorpayPaymentId: 'pay_123',
  total: 500,
  shippingAddress: { name: 'Asha', phone: '999', line1: '1 Road', city: 'Kochi', state: 'Kerala', pincode: '682001' },
  createdAt: new Date('2026-11-01T00:00:00Z'),
  items: [],
  user: { id: 'owner', name: 'Asha', email: 'asha@example.com', phone: '999' },
};

const context = { params: Promise.resolve({ id: 'MFS-123456' }) };
const url = (path: string) => new NextRequest(`http://localhost${path}`);

beforeEach(() => {
  vi.clearAllMocks();
  db.order.findFirst.mockResolvedValue(ORDER);
});

describe.each([
  ['order details', () => getOrder(url('/api/orders/MFS-123456'), context)],
  ['invoice', () => getInvoice(url('/api/orders/MFS-123456/invoice'), context)],
])('%s access', (_name, call) => {
  it('refuses a guest', async () => {
    getServerSession.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
  });

  it("hides another customer's order, as if it didn't exist", async () => {
    getServerSession.mockResolvedValue({ user: STRANGER });
    expect((await call()).status).toBe(404);
  });

  it('allows the customer who placed it', async () => {
    getServerSession.mockResolvedValue({ user: OWNER });
    expect((await call()).status).toBe(200);
  });

  it('allows an admin', async () => {
    getServerSession.mockResolvedValue({ user: ADMIN });
    expect((await call()).status).toBe(200);
  });
});

it('gives the order details the IDs a customer needs', async () => {
  getServerSession.mockResolvedValue({ user: OWNER });
  const { data } = await (await getOrder(url('/api/orders/MFS-123456'), context)).json();
  expect(data).toMatchObject({ orderNumber: 'MFS-123456', paymentId: 'pay_123' });
});

it('refuses cash on delivery while it is switched off', async () => {
  getServerSession.mockResolvedValue({ user: OWNER });
  const res = await createOrder(
    new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        paymentMethod: 'COD',
        shippingAddress: { name: 'Asha', phone: '99999', line1: '1 Road', city: 'Kochi', state: 'Kerala', pincode: '682001' },
      }),
    })
  );
  const json = await res.json();
  expect(res.status).toBe(400);
  expect(json.error).toMatch(/cash on delivery/i);
  expect(db.cart.findUnique).not.toHaveBeenCalled();
});
