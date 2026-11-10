import React from 'react';
import prisma from '@/lib/prisma';
import { reviewService } from '@/server/services/review.service';
import { reviewRepository } from '@/server/repositories/review.repository';
import { adminReviewQuerySchema } from '@/server/validators/review.validator';
import ReviewsClient from './ReviewsClient';
import type { AdminReviewPage } from './types';

export const metadata = { title: 'Reviews | Admin' };

// Reviews showing in the store. Hidden ones are on the Archive page.
export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; rating?: string; unanswered?: string; product?: string }>;
}) {
  const sp = await searchParams;
  const query = adminReviewQuerySchema.parse({
    page: sp?.page || undefined,
    q: sp?.q || undefined,
    rating: sp?.rating || undefined,
    unanswered: sp?.unanswered || undefined,
    product: sp?.product || undefined,
  });

  const [data, hiddenCount, openAppeals, product] = await Promise.all([
    reviewService.listForAdmin(query),
    reviewRepository.countHidden(),
    reviewRepository.countOpenAppeals(),
    query.product ? prisma.product.findUnique({ where: { id: query.product }, select: { id: true, title: true } }) : null,
  ]);

  return (
    <ReviewsClient
      data={data as AdminReviewPage}
      q={query.q ?? ''}
      rating={query.rating ? String(query.rating) : ''}
      unanswered={Boolean(query.unanswered)}
      product={product}
      hiddenCount={hiddenCount}
      openAppeals={openAppeals}
    />
  );
}
