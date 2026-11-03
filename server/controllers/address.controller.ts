import { NextRequest } from 'next/server';
import { addressSchema, updateAddressSchema } from '../validators/address.validator';
import { addressService } from '../services/address.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';
import { AuthenticatedUser } from '../middlewares/withAuth';

export const addressController = {
  async list(_req: NextRequest, user: AuthenticatedUser) {
    try {
      const addresses = await addressService.list(user.id);
      return apiResponse.ok(addresses);
    } catch (error) {
      return handleError(error);
    }
  },

  async create(req: NextRequest, user: AuthenticatedUser) {
    try {
      const body = await req.json();
      const input = addressSchema.parse(body);
      const address = await addressService.create(user.id, input);
      return apiResponse.created(address);
    } catch (error) {
      return handleError(error);
    }
  },

  async update(
    req: NextRequest,
    user: AuthenticatedUser,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
      const resolved = await context.params;
      const body = await req.json();
      const input = updateAddressSchema.parse(body);
      const address = await addressService.update(user.id, resolved.id, input);
      return apiResponse.ok(address);
    } catch (error) {
      return handleError(error);
    }
  },

  async delete(
    _req: NextRequest,
    user: AuthenticatedUser,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
      const resolved = await context.params;
      const result = await addressService.delete(user.id, resolved.id);
      return apiResponse.ok(result);
    } catch (error) {
      return handleError(error);
    }
  },
};
