import { razorpay } from '@/lib/razorpay';
import { orderRepository } from '../repositories/order.repository';
import { refundRepository, RazorpayRefundState } from '../repositories/refund.repository';
import { ApiError } from '../utils/ApiError';
import { orderService } from './order.service';

const CANCELLED_STATUSES = ['CANCELLATION_APPROVED', 'CANCELLED'];
// An approval may still be waiting on Razorpay until this long has passed.
const UNCONFIRMED_AFTER_MS = 2 * 60 * 1000;

interface RazorpayRefundEntity {
  id: string;
  payment_id: string;
  amount: number;
  status?: string;
  notes?: Record<string, string | number> | unknown[];
  error_description?: string;
}

function refundIdFromNotes(entity: { notes?: RazorpayRefundEntity['notes'] }) {
  const notes = entity.notes;
  if (!notes || Array.isArray(notes)) return undefined;
  return typeof notes.refundId === 'string' ? notes.refundId : undefined;
}

function stateOf(status?: string): RazorpayRefundState {
  if (status === 'processed') return 'processed';
  if (status === 'failed') return 'failed';
  return 'pending';
}

/** Razorpay gave a clear answer. Anything else, such as a timeout, means the money may have moved. */
function razorpayRefused(error: any) {
  return typeof error?.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500;
}

function formatRefund(refund: Awaited<ReturnType<typeof refundRepository.findLatestForOrder>>) {
  if (!refund) return null;
  return {
    id: refund.id,
    status: refund.status,
    amount: refund.amountPaise / 100,
    razorpayRefundId: refund.razorpayRefundId,
    failureReason: refund.failureReason,
    stockReturned: refund.stockReturned,
  };
}

async function adminResult(orderId: string, notice?: string) {
  const [order, refund] = await Promise.all([
    orderRepository.findById(orderId),
    refundRepository.findLatestForOrder(orderId),
  ]);
  return { paymentStatus: order?.paymentStatus, refund: formatRefund(refund), notice };
}

export const refundService = {
  formatRefund,

  async requestRefund(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId);
    // Someone else's order looks the same as one that doesn't exist.
    if (!order || order.userId !== userId) {
      throw ApiError.notFound('Order not found');
    }

    // Customers ask for their money back once their cancellation request is approved. An order the
    // store cancelled itself is refunded by the store (approveRefund), so it isn't offered here.
    if (order.status !== 'CANCELLATION_APPROVED') {
      throw ApiError.conflict('A refund can be requested once your cancellation is approved.');
    }
    // The amount comes from the order, never from the browser.
    const amountPaise = Math.round(order.total * 100);
    if (!(await refundRepository.createRequest(orderId, userId, amountPaise))) {
      throw ApiError.conflict("A refund can't be requested for this order.");
    }
    return orderService.formatOrder(await orderRepository.findById(orderId));
  },

  /**
   * The owner's approval, and the only place the store sends money back. For an order the store
   * cancelled itself (Cancelled), with no refund yet, it starts the refund here too: no request needed.
   */
  async approveRefund(orderId: string, adminId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    if (!CANCELLED_STATUSES.includes(order.status)) {
      throw ApiError.conflict('Only a cancelled order can be refunded. This order has moved on.');
    }
    if (order.paymentStatus !== 'PAID' || !order.razorpayPaymentId) {
      throw ApiError.conflict('This order has no online payment to refund.');
    }

    let refund = await refundRepository.findOpenForOrder(orderId);
    if (!refund && order.status === 'CANCELLED') {
      // The amount comes from the order. The create is conditional, so two clicks make one refund.
      await refundRepository.createRequest(orderId, null, Math.round(order.total * 100), ['CANCELLED']);
      refund = await refundRepository.findOpenForOrder(orderId);
    }
    if (!refund) throw ApiError.conflict('This order has no refund waiting for approval.');
    if (!razorpay) throw ApiError.internal('Online payment is not configured');
    if (!(await refundRepository.claimForApproval(refund.id, adminId))) {
      throw ApiError.conflict('This refund is already being processed.');
    }

    try {
      const sent = await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: refund.amountPaise,
        speed: 'normal',
        notes: { refundId: refund.id, orderNumber: order.orderNumber },
      });
      await refundRepository.applyRazorpayState(refund.id, stateOf(sent.status), sent.id);
      return adminResult(orderId);
    } catch (error: any) {
      if (razorpayRefused(error)) {
        const reason = error.error?.description || 'Razorpay refused this refund.';
        await refundRepository.markFailed(refund.id, reason);
        return adminResult(orderId);
      }
      // Not safe to mark as failed, because the refund may have gone through.
      console.error(`[Refunds] No clear answer from Razorpay for ${order.orderNumber}:`, error);
      return adminResult(orderId, "Razorpay didn't answer. Check the status before trying anything else.");
    }
  },

  /** The backup for webhooks: asks Razorpay what happened to a refund still in progress. */
  async checkRefundStatus(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    const refund = await refundRepository.findProcessingForOrder(orderId);
    if (!refund) return adminResult(orderId);
    if (!razorpay) throw ApiError.internal('Online payment is not configured');
    if (!order.razorpayPaymentId) throw ApiError.conflict('This order has no online payment.');

    let items: RazorpayRefundEntity[];
    try {
      items = (await razorpay.payments.fetchMultipleRefund(order.razorpayPaymentId)).items;
    } catch (error) {
      console.error(`[Refunds] Couldn't check ${order.orderNumber}:`, error);
      throw new ApiError(502, "Couldn't reach Razorpay. Please try again.");
    }

    const found = items.find(
      (item) => item.id === refund.razorpayRefundId || refundIdFromNotes(item) === refund.id
    );
    if (found) {
      await refundRepository.applyRazorpayState(refund.id, stateOf(found.status), found.id, found.error_description);
    } else if (!refund.razorpayRefundId && Date.now() - refund.updatedAt.getTime() > UNCONFIRMED_AFTER_MS) {
      await refundRepository.markFailed(refund.id, 'Razorpay has no record of this refund, so no money moved. You can try again.');
    }
    return adminResult(orderId);
  },

  async handleWebhook(eventType: string, entity: RazorpayRefundEntity) {
    const states: Record<string, RazorpayRefundState> = {
      'refund.created': 'pending',
      'refund.processed': 'processed',
      'refund.failed': 'failed',
    };
    const state = states[eventType];
    if (!state) return;

    let refund = await refundRepository.findByRazorpayId(entity.id);

    // The event can arrive before the store has saved Razorpay's id for its own refund.
    if (!refund) {
      const ownId = refundIdFromNotes(entity);
      if (ownId) refund = await refundRepository.findById(ownId);
    }

    const order = await orderRepository.findByRazorpayPaymentId(entity.payment_id);
    if (!order || (refund && refund.orderId !== order.id)) {
      console.error(`[Refunds] Refund ${entity.id} doesn't match any order.`);
      return;
    }

    if (!refund) {
      refund = await refundRepository.createFromRazorpay(order.id, entity.id, entity.amount);
      if (!refund) return;
    }

    await refundRepository.applyRazorpayState(refund.id, state, entity.id, entity.error_description);
  },
};
