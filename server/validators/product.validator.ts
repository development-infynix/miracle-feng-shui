import { z } from 'zod';

export const productQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  freeShipping: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  onSale: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  sort: z.enum(['relevancy', 'price_asc', 'price_desc', 'rating', 'newest']).default('relevancy'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
