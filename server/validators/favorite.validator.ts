import { z } from 'zod';

export const toggleFavoriteSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;

export const favoriteListQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(50).default(15),
});
