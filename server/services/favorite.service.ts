import { favoriteRepository } from '../repositories/favorite.repository';
import { productRepository } from '../repositories/product.repository';
import { ApiError } from '../utils/ApiError';
import { productService } from './product.service';

export const favoriteService = {
  async list(userId: string) {
    const favorites = await favoriteRepository.findUserFavorites(userId);
    return favorites.map((f) => productService.formatProduct(f.product));
  },

  async toggle(userId: string, productId: string) {
    const product = await productRepository.findBySlugOrId(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const existing = await favoriteRepository.findByUserAndProduct(userId, productId);
    if (existing) {
      await favoriteRepository.delete(userId, productId);
      return { isFavorite: false, productId };
    }

    await favoriteRepository.create(userId, productId);
    return { isFavorite: true, productId };
  },

  async remove(userId: string, productId: string) {
    await favoriteRepository.delete(userId, productId);
    return { isFavorite: false, productId };
  },
};
