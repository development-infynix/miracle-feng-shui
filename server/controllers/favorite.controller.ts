import { NextRequest } from 'next/server';
import { toggleFavoriteSchema } from '../validators/favorite.validator';
import { favoriteService } from '../services/favorite.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';
import { AuthenticatedUser } from '../middlewares/withAuth';

export const favoriteController = {
  async list(_req: NextRequest, user: AuthenticatedUser) {
    try {
      const favorites = await favoriteService.list(user.id);
      return apiResponse.ok(favorites);
    } catch (error) {
      return handleError(error);
    }
  },

  async toggle(req: NextRequest, user: AuthenticatedUser) {
    try {
      const body = await req.json();
      const input = toggleFavoriteSchema.parse(body);
      const result = await favoriteService.toggle(user.id, input.productId);
      return apiResponse.ok(result);
    } catch (error) {
      return handleError(error);
    }
  },

  async remove(
    _req: NextRequest,
    user: AuthenticatedUser,
    context: { params: Promise<{ productId: string }> }
  ) {
    try {
      const resolved = await context.params;
      const result = await favoriteService.remove(user.id, resolved.productId);
      return apiResponse.ok(result);
    } catch (error) {
      return handleError(error);
    }
  },
};
