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
      if (input.isDefault) {
        await addressRepository.clearDefault(userId, tx);
      }
      return addressRepository.create(userId, input, tx);
    });
  },

  async update(userId: string, addressId: string, input: UpdateAddressInput) {
    const existing = await addressRepository.findById(addressId);
    if (!existing || existing.userId !== userId) {
      throw ApiError.notFound('Address not found');
    }

    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await addressRepository.clearDefault(userId, tx);
      }
      await addressRepository.update(addressId, userId, input, tx);
      return addressRepository.findById(addressId, tx);
    });
  },

  async delete(userId: string, addressId: string) {
    const existing = await addressRepository.findById(addressId);
    if (!existing || existing.userId !== userId) {
      throw ApiError.notFound('Address not found');
    }

    await addressRepository.delete(addressId, userId);
    return { success: true, id: addressId };
  },
};
