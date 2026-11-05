import { NextRequest } from 'next/server';
import { favoriteListQuerySchema, toggleFavoriteSchema } from '../validators/favorite.validator';
import { favoriteService } from '../services/favorite.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';
import { AuthenticatedUser } from '../middlewares/withAuth';

export const favoriteController = {
  async list(req: NextRequest, user: AuthenticatedUser) {
    try {
      // With no paging asked for, this stays the full list that the hearts across the store rely on.
      const params = req.nextUrl.searchParams;
      if (params.has('skip') || params.has('take')) {
        const range = favoriteListQuerySchema.parse(Object.fromEntries(params));
        return apiResponse.ok(await favoriteService.listPage(user.id, range));
      }
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
