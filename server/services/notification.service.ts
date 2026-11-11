import { notificationRepository, type NewNotification } from '../repositories/notification.repository';
import type { ReviewNotice } from './email.service';
import type { OrderStatus } from '@/app/generated/prisma/client';

export const NOTIFICATION_PAGE_SIZE = 50;

/** My orders, with that order's details drawer open. */
const orderLink = (orderNumber: string) => `/profile?tab=orders&order=${encodeURIComponent(orderNumber)}`;
const productLink = (productId: string) => `/shop?product=${encodeURIComponent(productId)}`;

export interface OrderChange {
  orderNumber: string;
  from: OrderStatus;
  to: OrderStatus;
  /** The admin's note on the change; for a store cancellation, the reason the customer is owed. */
  note?: string | null;
  paidOnline: boolean;
  trackingNumber?: string | null;
  courier?: string | null;
}

const CANCELLATION_STAGES: OrderStatus[] = ['CANCELLATION_REQUESTED', 'CANCELLATION_APPROVED', 'CANCELLED'];

/**
 * What to tell the customer about a status change, or null when it isn't worth a notification.
 * Only steps the customer cares about: shipped, delivered, cancelled by the store, and the answer to
 * their own cancellation request.
 */
export function orderChangeNotice(change: OrderChange): NewNotification | null {
  const { orderNumber, from, to, note } = change;
  if (from === to) return null;
  const reason = note?.trim();

  if (to === 'SHIPPED') {
    const tracking = change.trackingNumber
      ? ` Tracking: ${change.courier ? `${change.courier} ` : ''}${change.trackingNumber}.`
      : '';
    return { kind: 'ORDER', title: `Order ${orderNumber} has shipped`, body: `It's on its way to you.${tracking}`, link: orderLink(orderNumber) };
  }
  if (to === 'DELIVERED') {
    return {
      kind: 'ORDER',
      title: `Order ${orderNumber} was delivered`,
      body: 'We hope you love it. You can now review what you bought.',
      link: orderLink(orderNumber),
    };
  }
  if (to === 'CANCELLATION_APPROVED' && from === 'CANCELLATION_REQUESTED') {
    return {
      kind: 'ORDER',
      title: 'Your cancellation was approved',
      body: change.paidOnline
        ? `Order ${orderNumber} is cancelled. You can ask for your refund from My orders.`
        : `Order ${orderNumber} is cancelled.`,
      link: orderLink(orderNumber),
    };
  }
  if (to === 'CANCELLED' && !CANCELLATION_STAGES.includes(from)) {
    return {
      kind: 'ORDER',
      title: `We cancelled order ${orderNumber}`,
      body: `${reason ? `Reason: ${reason}` : 'Sorry, we had to cancel this order.'}${change.paidOnline ? " We'll refund your payment." : ''}`,
      link: orderLink(orderNumber),
    };
  }
  if (from === 'CANCELLATION_REQUESTED' && !CANCELLATION_STAGES.includes(to)) {
    return {
      kind: 'ORDER',
      title: 'Your cancellation request was declined',
      body: reason ? `Order ${orderNumber}: ${reason}` : `Order ${orderNumber} will go ahead as planned.`,
      link: orderLink(orderNumber),
    };
  }
  return null;
}

/**
 * What to tell the author in the app about their review. Only a restore: a take-down isn't a
 * notification, because the author sees it (and why) on the product page, and gets an email.
 */
export function reviewNotice(productTitle: string, productId: string, notice: ReviewNotice): NewNotification | null {
  if (notice.kind === 'hidden') return null;
  return {
    kind: 'REVIEW',
    title: 'Your review is back',
    body: `Your review of ${productTitle} is showing again.`,
    link: productLink(productId),
  };
}

const rupees = (amountPaise: number) =>
  (amountPaise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

/** Sent once, when the order is placed: paid online, or placed as cash on delivery. */
export function orderConfirmedNotice(orderNumber: string, totalPaise: number, cashOnDelivery: boolean): NewNotification {
  return {
    kind: 'ORDER',
    title: `Order ${orderNumber} is confirmed`,
    body: cashOnDelivery
      ? `Thanks for your order! Please pay ${rupees(totalPaise)} on delivery. We'll let you know when it ships.`
      : `Thanks for your order! We've received your payment of ${rupees(totalPaise)}. We'll let you know when it ships.`,
    link: orderLink(orderNumber),
  };
}

/** Sent when the store sends the refund to Razorpay; refundNotice follows once the money has gone back. */
export function refundStartedNotice(orderNumber: string, amountPaise: number): NewNotification {
  return {
    kind: 'REFUND',
    title: "We've started your refund",
    body: `We've started a refund of ${rupees(amountPaise)} for order ${orderNumber}. We'll let you know once it's on its way.`,
    link: orderLink(orderNumber),
  };
}

export function refundNotice(orderNumber: string, amountPaise: number): NewNotification {
  const amount = rupees(amountPaise);
  return {
    kind: 'REFUND',
    title: 'Your refund is on its way',
    body: `We've refunded ${amount} for order ${orderNumber}. It can take 5–7 working days to reach your account.`,
    link: orderLink(orderNumber),
  };
}

export const notificationService = {
  /** Adds a notification. Never throws: telling the customer must not fail what the store just did. */
  notify(userId: string | null | undefined, notification: NewNotification | null) {
    if (!userId || !notification) return;
    void notificationRepository
      .create(userId, notification)
      .catch((err) => console.error('[Notifications] Could not save a notification:', err));
  },

  async list(userId: string) {
    const [items, unread] = await Promise.all([
      notificationRepository.listForUser(userId, NOTIFICATION_PAGE_SIZE),
      notificationRepository.countUnread(userId),
    ]);
    return {
      items: items.map((n) => ({
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        link: n.link,
        read: Boolean(n.readAt),
        createdAt: n.createdAt.toISOString(),
      })),
      unread,
    };
  },

  async unreadCount(userId: string) {
    return { unread: await notificationRepository.countUnread(userId) };
  },

  /**
   * Marks one notification read, or all of them when no id is given. Another customer's id, or one
   * already read or cleared, just changes nothing.
   */
  async markRead(userId: string, id?: string) {
    return { updated: await notificationRepository.markRead(userId, id) };
  },

  async clearAll(userId: string) {
    return { cleared: await notificationRepository.clearAll(userId) };
  },
};
