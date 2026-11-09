import type { OrderStatus } from '@/app/generated/prisma/client';

/** The steps a customer sees. Internal ones (Processing, or a status corrected back) stay admin-only. */
export type CustomerStep =
  | 'placed'
  | 'shipped'
  | 'delivered'
  | 'cancellation_requested'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded';

export interface TimelineEntry {
  step: CustomerStep;
  at: string;
}

interface StatusEvent {
  toStatus: OrderStatus;
  createdAt: Date | string;
}

interface OrderForTimeline {
  createdAt: Date | string;
  refundRequestedAt?: Date | string | null;
  statusEvents?: StatusEvent[];
  refunds?: { status: string; updatedAt: Date | string }[];
}

// How far along the order is. Moving to a lower stage (an admin correcting a mistake) takes the later
// steps off the customer's timeline, so it always matches where the order really is.
const STAGE: Record<OrderStatus, number> = {
  PENDING: 0,
  PAID: 0,
  COD_PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLATION_REQUESTED: 4,
  CANCELLATION_APPROVED: 5,
  CANCELLED: 5,
};

const STEP: Partial<Record<OrderStatus, CustomerStep>> = {
  PENDING: 'placed',
  PAID: 'placed',
  COD_PENDING: 'placed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLATION_REQUESTED: 'cancellation_requested',
  CANCELLATION_APPROVED: 'cancelled',
  CANCELLED: 'cancelled',
};

const iso = (value: Date | string) => new Date(value).toISOString();
const time = (value: Date | string) => new Date(value).getTime();

/** The customer's view of an order's history, oldest first. */
export function customerTimeline(order: OrderForTimeline): TimelineEntry[] {
  const events = [...(order.statusEvents ?? [])].sort((a, b) => time(a.createdAt) - time(b.createdAt));
  let steps: (TimelineEntry & { stage: number })[] = [];

  for (const event of events) {
    const stage = STAGE[event.toStatus];
    // Placed always stays; anything at or past the new stage is undone by it.
    steps = steps.filter((s) => s.step === 'placed' || s.stage < stage);
    const step = STEP[event.toStatus];
    if (!step || (step === 'placed' && steps.some((s) => s.step === 'placed'))) continue;
    steps.push({ step, at: iso(event.createdAt), stage });
  }

  // An order from before history began, or made somewhere that doesn't write history yet.
  if (!steps.some((s) => s.step === 'placed')) steps.unshift({ step: 'placed', at: iso(order.createdAt), stage: 0 });

  const timeline: TimelineEntry[] = steps.map(({ step, at }) => ({ step, at }));
  if (order.refundRequestedAt) timeline.push({ step: 'refund_requested', at: iso(order.refundRequestedAt) });
  const refunded = order.refunds?.find((refund) => refund.status === 'PROCESSED');
  if (refunded) timeline.push({ step: 'refunded', at: iso(refunded.updatedAt) });

  return timeline.sort((a, b) => time(a.at) - time(b.at));
}
