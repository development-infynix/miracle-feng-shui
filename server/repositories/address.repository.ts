import prisma from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma/client';
import { AddressInput, UpdateAddressInput } from '../validators/address.validator';

export const addressRepository = {
  async findUserAddresses(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.address.findUnique({
      where: { id },
    });
  },

  async clearDefault(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  },

  async create(userId: string, input: AddressInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.address.create({
      data: {
        userId,
        name: input.name,
        phone: input.phone,
        line1: input.line1,
        line2: input.line2,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        country: input.country || 'India',
        isDefault: input.isDefault ?? false,
      },
    });
  },

  async update(
    id: string,
    userId: string,
    input: UpdateAddressInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.address.updateMany({
      where: { id, userId },
      data: input,
    });
  },

  async delete(id: string, userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.address.deleteMany({
      where: { id, userId },
    });
  },
};
