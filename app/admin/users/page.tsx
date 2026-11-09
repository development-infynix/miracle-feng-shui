import React from 'react';
import prisma from '@/lib/prisma';
import UsersToolbar from './components/UsersToolbar';
import UsersFooter from './components/UsersFooter';
import UsersView from './components/UsersView';

export const metadata = { title: 'Customer Users | Admin' };

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp?.q?.trim() || '';
  const requestedPage = Math.floor(Number(sp?.page));
  const page = requestedPage > 0 ? requestedPage : 1;

  const where = {
    role: 'CUSTOMER' as const,
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { email: { contains: q, mode: 'insensitive' as const } },
        { phone: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      // Allowlist, not `include`: this result goes to a client component, so every
      // selected field reaches the browser. Never add passwordHash or resetToken*.
      // Only what the list shows: each drawer tab loads its own data on demand.
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        deactivatedAt: true,
        _count: { select: { orders: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      className="flex flex-col gap-4 h-screen overflow-hidden -mx-3 -my-5 sm:-mx-4 lg:-mx-5"
    >
      <UsersToolbar search={q} total={total} />

      {/* Client boundary: owns the selected customer + detail drawer, and
      renders the desktop table / mobile card stack responsively. */}
      <UsersView users={users} page={page} pageSize={PAGE_SIZE} search={q} />

      <UsersFooter page={page} totalPages={totalPages} total={total} search={q} />
    </div>
  );
}
