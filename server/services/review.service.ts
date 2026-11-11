import { reviewRepository } from '../repositories/review.repository';
import { productRepository } from '../repositories/product.repository';
import { AdminReviewQuery, CreateReviewInput, SetReviewHiddenInput } from '../validators/review.validator';
import { ApiError } from '../utils/ApiError';
import { emailService, sendReviewNoticeEmail, ReviewNotice } from './email.service';
import { notificationService, reviewNotice } from './notification.service';
import type { ReviewHideReason } from '@/app/generated/prisma/client';

/** How each hide reason reads to the customer ("…taken down because {this}"). Never the admin's private note. */
export const CUSTOMER_HIDE_REASON: Record<ReviewHideReason, string> = {
  ABUSIVE: 'it contained abusive or offensive language',
  SPAM: 'it contained advertising, spam or links',
  PERSONAL_DETAILS: 'it shared personal details, like a phone number or address',
  OFF_TOPIC: "it wasn't about this product",
  NOT_GENUINE: "it didn't appear to be a genuine customer review",
  OTHER: "it didn't meet our review guidelines",
};

const productUrl = (productId: string) =>
  `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shop?product=${encodeURIComponent(productId)}`;

export const REVIEW_PAGE_SIZE = 20;
export const ADMIN_REVIEW_PAGE_SIZE = 20;

export const reviewService = {
  /**
   * A review is a verified purchase when its author had this product delivered from this shop before
   * writing it. Anyone can still review (they may have bought it elsewhere); this only marks the ones we can vouch for.
   */
  async markVerified<T extends { userId: string; productId: string; createdAt: Date | string }>(productId: string, reviews: T[]) {
    const deliveries = await reviewRepository.findDeliveries(productId, [...new Set(reviews.map((r) => r.userId))]);
    return reviews.map((review) => ({
      ...review,
      verifiedPurchase: deliveries.some(
        (d) => d.userId === review.userId && d.deliveredAt.getTime() <= new Date(review.createdAt).getTime()
      ),
    }));
  },

  formatReview(r: any) {
    return {
      id: r.id,
      author: r.user?.name || 'Customer',
      rating: r.rating,
      date: new Date(r.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      comment: r.comment,
      productVariation: r.productVariation || undefined,
      productId: r.productId,
      verifiedPurchase: Boolean(r.verifiedPurchase),
      reply: r.reply ? { text: r.reply, date: new Date(r.repliedAt ?? r.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) } : null,
    };
  },

  /**
   * Whether this customer can review this product: any signed-in customer, once per product.
   * Whether it's a Verified Purchase is worked out separately (markVerified).
   */
  async eligibility(userId: string, productIdentifier: string) {
    const product = await productRepository.findBySlugOrId(productIdentifier);
    if (!product) throw ApiError.notFound('Product not found');
    const own = await reviewRepository.findByUserAndProduct(userId, product.id);
    if (own?.hiddenAt) {
      // Only its author sees a hidden review, with why. They can delete it and write a new one.
      return {
        canReview: false,
        reason: 'hidden' as const,
        hiddenReview: {
          rating: own.rating,
          comment: own.comment,
          reasonCode: own.hiddenReason ?? 'OTHER',
          because: CUSTOMER_HIDE_REASON[own.hiddenReason ?? 'OTHER'],
        },
      };
    }
    if (own) {
      return { canReview: false, reason: 'already_reviewed' as const };
    }
    return { canReview: true, reason: null };
  },

  /** The author deletes their own review for good, so they can write a new one. */
  async deleteOwn(userId: string, productIdentifier: string) {
    const product = await productRepository.findBySlugOrId(productIdentifier);
    if (!product) throw ApiError.notFound('Product not found');
    const own = await reviewRepository.findByUserAndProduct(userId, product.id);
    if (!own || !(await reviewRepository.deleteOwn(own.id, userId))) {
      throw ApiError.notFound("You haven't reviewed this product.");
    }
    return { deleted: true };
  },

  /** Tells the author in the app and by email. Never blocks or fails the admin's action. */
  notifyAuthor(reviewId: string, notice: ReviewNotice) {
    void reviewRepository
      .findForNotice(reviewId)
      .then((r) => {
        if (!r) return;
        notificationService.notify(r.user?.id, reviewNotice(r.product.title, r.product.id, notice));
        if (!r.user?.email) return;
        return sendReviewNoticeEmail(emailService, {
          email: r.user.email,
          name: r.user.name,
          productTitle: r.product.title,
          productUrl: productUrl(r.product.id),
          notice,
        });
      })
      .catch((err) => console.error('[ReviewService] Could not send review notice:', err));
  },

  async listByProduct(identifier: string, page: number) {
    const product = await productRepository.findBySlugOrId(identifier);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const { items, total } = await reviewRepository.findPageByProductId(product.id, {
      skip: (page - 1) * REVIEW_PAGE_SIZE,
      take: REVIEW_PAGE_SIZE,
    });

    const verified = await this.markVerified(product.id, items);
    return {
      items: verified.map((review) => this.formatReview(review)),
      total,
      page,
      hasMore: page * REVIEW_PAGE_SIZE < total,
    };
  },

  async create(userId: string, productId: string, input: CreateReviewInput) {
    const product = await productRepository.findBySlugOrId(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const existing = await reviewRepository.findByUserAndProduct(userId, product.id);
    if (existing) {
      throw ApiError.conflict('You have already submitted a review for this product');
    }

    // Any signed-in customer can review. Only those who had it delivered first get Verified Purchase.
    // Reviews don't change a product's rating. Admins set the rating themselves.
    const review = await reviewRepository.create(userId, product.id, input);

    const [verified] = await this.markVerified(product.id, [review]);
    return this.formatReview(verified);
  },

  // ---- Admin ----

  /** Shown reviews for the Reviews page, or hidden ones (`hidden: true`) for the Archive. Newest first. */
  async listForAdmin(query: AdminReviewQuery, hidden = false) {
    const { items, total } = await reviewRepository.findForAdmin({
      hidden,
      rating: query.rating,
      unanswered: query.unanswered,
      productId: query.product,
      q: query.q,
      skip: (query.page - 1) * ADMIN_REVIEW_PAGE_SIZE,
      take: ADMIN_REVIEW_PAGE_SIZE,
    });
    const deliveries = await reviewRepository.findDeliveriesFor(items.map((r) => ({ userId: r.userId, productId: r.productId })));
    return {
      items: items.map((r) => {
        const hiddenBy = r.events[0]?.changedBy;
        return {
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
          author: r.user?.name || 'Customer',
          email: r.user?.email || '',
          product: { id: r.product.id, title: r.product.title, slug: r.product.slug, image: r.product.images?.[0] ?? null },
          verifiedPurchase: deliveries.some(
            (d) => d.userId === r.userId && d.productId === r.productId && d.deliveredAt.getTime() <= r.createdAt.getTime()
          ),
          reply: r.reply,
          repliedAt: r.repliedAt?.toISOString() ?? null,
          hiddenAt: r.hiddenAt?.toISOString() ?? null,
          hiddenReason: r.hiddenReason,
          hiddenNote: r.hiddenNote,
          hiddenBy: hiddenBy ? hiddenBy.name || hiddenBy.email : null,
        };
      }),
      total,
      page: query.page,
      pageSize: ADMIN_REVIEW_PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / ADMIN_REVIEW_PAGE_SIZE)),
    };
  },

  /** Hide moves the review to the Archive (out of the store); restore brings it back. Reviews are never deleted. */
  async setHidden(id: string, input: SetReviewHiddenInput, adminId?: string) {
    const existing = await reviewRepository.findById(id);
    if (!existing) throw ApiError.notFound('Review not found');
    const hide = input.hidden ? { reason: input.reason, note: input.note || null } : null;
    const done = await reviewRepository.setHidden(id, hide, adminId ?? null);
    if (!done) {
      throw ApiError.conflict(input.hidden ? 'This review is already hidden.' : "This review isn't hidden.");
    }
    this.notifyAuthor(id, hide ? { kind: 'hidden', because: CUSTOMER_HIDE_REASON[hide.reason] } : { kind: 'restored' });
    return { id, hidden: input.hidden };
  },

  /** Sets the store's public reply under a review. An empty reply removes it. */
  async setReply(id: string, reply: string, adminId?: string) {
    const existing = await reviewRepository.findById(id);
    if (!existing) throw ApiError.notFound('Review not found');
    const text = reply.trim() || null;
    if (!text && !existing.reply) return { id, reply: null, repliedAt: null };
    const saved = await reviewRepository.setReply(id, text, adminId ?? null);
    return { id, reply: saved.reply, repliedAt: saved.repliedAt?.toISOString() ?? null };
  },
};
