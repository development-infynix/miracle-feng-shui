import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().min(3, 'Review comment must be at least 3 characters'),
  productVariation: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const REVIEW_HIDE_REASONS = ['ABUSIVE', 'SPAM', 'PERSONAL_DETAILS', 'OFF_TOPIC', 'NOT_GENUINE', 'OTHER'] as const;

/** Hide (with a reason about what the review says) or restore a review. "Other" needs a note. */
export const setReviewHiddenSchema = z.discriminatedUnion('hidden', [
  z.object({
    hidden: z.literal(true),
    reason: z.enum(REVIEW_HIDE_REASONS),
    note: z.string().trim().max(500).optional(),
  }).refine((v) => v.reason !== 'OTHER' || Boolean(v.note), { message: 'Say why, for "Other".', path: ['note'] }),
  z.object({ hidden: z.literal(false) }),
]);
export type SetReviewHiddenInput = z.infer<typeof setReviewHiddenSchema>;

/** The store's public reply. Empty removes it. */
export const reviewReplySchema = z.object({ reply: z.string().trim().max(1000) });

export const adminReviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  rating: z.union([z.literal('low'), z.coerce.number().int().min(1).max(5)]).optional().catch(undefined),
  unanswered: z.stringbool().optional().catch(undefined),
  product: z.string().max(100).optional(),
  q: z.string().max(200).optional(),
});
export type AdminReviewQuery = z.infer<typeof adminReviewQuerySchema>;

export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});
