import { z } from 'zod';

export const toggleFavoriteSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;
