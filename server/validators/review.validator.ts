import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(3, 'Review comment must be at least 3 characters'),
  productVariation: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
