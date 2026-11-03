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

  async create(
    data: {
      name: string;
      email: string;
      passwordHash: string;
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
        passwordHash: data.passwordHash,
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
      },
    });
  },

  async update(
    id: string,
    data: { name?: string; phone?: string },
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
