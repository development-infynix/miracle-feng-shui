import prisma from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma/client';

export const userRepository = {
  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.user.findUnique({
      where: { id },
      include: {
        addresses: true,
      },
    });
  },

  async findByEmail(email: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        addresses: true,
      },
    });
  },

  /** Just what an open session needs re-checked: whether the account still exists and is active. */
  async findSessionStatus(id: string) {
    return prisma.user.findUnique({ where: { id }, select: { deactivatedAt: true, sessionVersion: true } });
  },

  /** Signs out every session issued before now. Returns the new version for the session that stays. */
  async bumpSessionVersion(id: string) {
    return prisma.user.update({ where: { id }, data: { sessionVersion: { increment: 1 } }, select: { sessionVersion: true } });
  },

  async findByGoogleId(googleId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.user.findUnique({ where: { googleId } });
  },

  async linkGoogle(id: string, googleId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.user.update({ where: { id }, data: { googleId } });
  },

  async create(
    data: {
      name: string;
      email: string;
      /** Left out for Google accounts, which have no password. */
      passwordHash?: string | null;
      googleId?: string;
      role?: 'CUSTOMER' | 'ADMIN';
      phone?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash ?? null,
        googleId: data.googleId,
        role: data.role || 'CUSTOMER',
        phone: data.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        sessionVersion: true,
      },
    });
  },

  async update(
    id: string,
    data: { name?: string; phone?: string | null },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });
  },

  async setResetToken(
    email: string,
    resetToken: string,
    resetTokenExpiry: Date,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
  },

  async findByResetToken(token: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });
  },

  async updatePassword(
    id: string,
    passwordHash: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.user.update({
      where: { id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  },
};
