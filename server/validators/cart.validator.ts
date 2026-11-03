import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  selectedVariations: z.record(z.string(), z.string()).optional(),
  personalizationText: z.string().optional(),
  isGift: z.boolean().optional().default(false),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
