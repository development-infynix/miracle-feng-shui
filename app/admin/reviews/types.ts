export type ReviewHideReason = 'ABUSIVE' | 'SPAM' | 'PERSONAL_DETAILS' | 'OFF_TOPIC' | 'NOT_GENUINE' | 'OTHER';

/** Reasons are about what the review says, never how many stars it gave. */
export const HIDE_REASONS: { value: ReviewHideReason; label: string }[] = [
  { value: 'ABUSIVE', label: 'Abusive or offensive' },
  { value: 'SPAM', label: 'Spam, ads or links' },
  { value: 'PERSONAL_DETAILS', label: 'Shares personal details' },
  { value: 'OFF_TOPIC', label: 'Not about this product' },
  { value: 'NOT_GENUINE', label: 'Fake, or not a real customer' },
  { value: 'OTHER', label: 'Other (say why)' },
];

export const hideReasonLabel = (reason: ReviewHideReason | null) =>
  HIDE_REASONS.find((r) => r.value === reason)?.label.replace(' (say why)', '') ?? 'Hidden';

export interface AdminReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: string;
  email: string;
  product: { id: string; title: string; slug: string; image: string | null };
  verifiedPurchase: boolean;
  reply: string | null;
  repliedAt: string | null;
  hiddenAt: string | null;
  hiddenReason: ReviewHideReason | null;
  hiddenNote: string | null;
  hiddenBy: string | null;
}

export interface AdminReviewPage {
  items: AdminReview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
