import prisma from '@/lib/prisma';
import { addressRepository } from '../repositories/address.repository';
import { AddressInput, UpdateAddressInput } from '../validators/address.validator';
import { ApiError } from '../utils/ApiError';

export const addressService = {
  async list(userId: string) {
    return addressRepository.findUserAddresses(userId);
  },

  async create(userId: string, input: AddressInput) {
    return prisma.$transaction(async (tx) => {
      // A customer's first address is always their primary one.
      const isFirst = (await addressRepository.countUserAddresses(userId, tx)) === 0;
      const isDefault = input.isDefault || isFirst;
      if (isDefault) {
        await addressRepository.clearDefault(userId, tx);
      }
      return addressRepository.create(userId, { ...input, isDefault }, tx);
    });
  },

  async update(userId: string, addressId: string, input: UpdateAddressInput) {
    const existing = await addressRepository.findById(addressId);
    if (!existing || existing.userId !== userId) {
      throw ApiError.notFound('Address not found');
    }

    // The primary address only changes by choosing another one, so there's always exactly one.
    const data = existing.isDefault && input.isDefault === false ? { ...input, isDefault: true } : input;

    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await addressRepository.clearDefault(userId, tx);
      }
      await addressRepository.update(addressId, userId, data, tx);
      return addressRepository.findById(addressId, tx);
    });
  },

  async delete(userId: string, addressId: string) {
    const existing = await addressRepository.findById(addressId);
    if (!existing || existing.userId !== userId) {
      throw ApiError.notFound('Address not found');
    }

    await prisma.$transaction(async (tx) => {
      await addressRepository.delete(addressId, userId, tx);
      if (existing.isDefault) {
        // findUserAddresses lists the newest first when none is primary.
        const [next] = await addressRepository.findUserAddresses(userId, tx);
        if (next) await addressRepository.update(next.id, userId, { isDefault: true }, tx);
      }
    });
    return { success: true, id: addressId };
  },
};
