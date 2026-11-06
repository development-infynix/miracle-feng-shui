import crypto from 'crypto';
import { razorpay } from '@/lib/razorpay';
import { orderRepository } from '../repositories/order.repository';
import { checkoutSessionRepository } from '../repositories/checkout-session.repository';
import { cartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { userRepository } from '../repositories/user.repository';
import { orderService } from './order.service';
import { emailService } from './email.service';
import { refundService } from './refund.service';
import { CreatePaymentOrderInput, VerifyPaymentInput } from '../validators/payment.validator';
import { ApiError } from '../utils/ApiError';

function signatureMatches(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

/**
 * Totalling what Razorpay captured can never be less than the session total.
 * A valid signature only proves a payment happened — not that it was the full amount.
 */
async function paymentAmountMatches(razorpayOrderId: string, paymentId: string) {
  const session = await checkoutSessionRepository.findSession(razorpayOrderId);
  if (!session) return false;
  const payment = await razorpay.payments.fetch(paymentId);
  return (payment.status === 'captured' || payment.status === 'authorized')
    ? payment.amount === Math.round(session.total * 100) && payment.currency === 'INR'
    : false;
}

async function sendPaidOrderEmail(orderId: string) {
  const order = await orderRepository.findById(orderId);
  const formatted = orderService.formatOrder(order);
  emailService
    .sendOrderConfirmationEmail({
      orderNumber: formatted.orderNumber,
      customerName: formatted.customerName,
      email: formatted.email,
      phone: formatted.phone,
      address: formatted.address,
      paymentMethod: formatted.paymentMethod,
      paymentStatus: 'Paid in Full',
      totalAmount: formatted.totalAmount,
      items: formatted.items,
      date: formatted.date,
    })
    .catch((err) => console.error('[PaymentService] Email dispatch failed:', err));
  return formatted;
}

async function newOrderNumber() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const orderNumber = `MFS-${Math.floor(100000 + Math.random() * 900000)}`;
    if (!(await checkoutSessionRepository.orderNumberTaken(orderNumber))) return orderNumber;
  }
  throw ApiError.internal('We could not start the payment. Please try again shortly.');
}

export const paymentService = {
  async createRazorpayOrder(userId: string, input: CreatePaymentOrderInput) {
    const [cart, user] = await Promise.all([
      cartRepository.findOrCreateCart(userId),
      userRepository.findById(userId),
    ]);

    if (!cart.items || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    // Validate stock and compute server-side total
    let total = 0;
    const orderItemsData: {
      productId: string;
      title: string;
      price: number;
      quantity: number;
      image: string;
      selectedVariations?: any;
      personalizationText?: string;
    }[] = [];

    for (const item of cart.items) {
      const product = await productRepository.findById(item.productId);
      if (!product || !product.isActive) {
        throw ApiError.badRequest(`"${item.product.title}" is no longer available. Remove it from your cart to continue.`);
      }

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for "${product.title}". Requested: ${item.quantity}, Available: ${product.stock}`
        );
      }

      total += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || '',
        selectedVariations: item.selectedVariations,
        personalizationText: item.personalizationText ?? undefined,
      });
    }

    const orderNumber = await newOrderNumber();
    const amountInPaise = Math.round(total * 100);

    // Nothing is saved unless Razorpay accepts it, because the customer would have no way to pay.
    if (!razorpay) {
      console.error('[PaymentService] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set.');
      throw ApiError.internal('Online payment is unavailable right now. Please try again shortly.');
    }

    let razorpayOrderId: string;
    try {
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          userId,
          orderNumber,
        },
      });
      razorpayOrderId = rzpOrder.id;
    } catch (rzpErr: any) {
      console.error('[PaymentService] Razorpay order creation failed:', rzpErr?.error?.description || rzpErr?.message);
      throw ApiError.internal('We could not start the payment. Please try again shortly.');
    }

    // No order exists until the payment is confirmed. This holds what's being paid for until then.
    await checkoutSessionRepository.deleteExpired();
    await checkoutSessionRepository.create({
      razorpayOrderId,
      orderNumber,
      userId,
      total,
      shippingAddress: input.shippingAddress,
      items: orderItemsData,
    });

    return {
      orderNumber,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      user: {
        name: input.shippingAddress.name,
        email: user?.email || '',
        phone: input.shippingAddress.phone,
      },
    };
  },

  async verifyPayment(userId: string, input: VerifyPaymentInput) {
    // A valid signature only proves the payment is real, so it must also be this customer's.
    const ownerId = await checkoutSessionRepository.findOwner(input.razorpay_order_id);
    if (!ownerId) {
      throw ApiError.notFound('Order not found');
    }
    if (ownerId !== userId) {
      throw ApiError.forbidden('This payment does not belong to this account');
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw ApiError.internal('Online payment is not configured');
    const text = `${input.razorpay_order_id}|${input.razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');

    if (!signatureMatches(expectedSignature, input.razorpay_signature)) {
      throw ApiError.badRequest('Invalid Razorpay payment signature');
    }

    if (!(await paymentAmountMatches(input.razorpay_order_id, input.razorpay_payment_id))) {
      throw ApiError.badRequest('Payment amount does not match the order total');
    }

    const result = await checkoutSessionRepository.completePayment(input.razorpay_order_id, input.razorpay_payment_id);
    if (!result) throw ApiError.notFound('Order not found');
    if (result.created) return sendPaidOrderEmail(result.orderId);

    // The webhook got here first, and has already sent the confirmation.
    return orderService.formatOrder(await orderRepository.findById(result.orderId));
  },

  async handleWebhook(rawBody: string, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw ApiError.internal('Webhook secret not configured');
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    if (!signatureMatches(expectedSignature, signature)) {
      throw ApiError.badRequest('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === 'payment.captured') {
      const payment = event.payload.payment.entity;
      if (!(await paymentAmountMatches(payment.order_id, payment.id))) {
        console.error(`[Payments] Payment ${payment.id} amount does not match the session total. Razorpay order: ${payment.order_id}`);
        return { received: true };
      }
      // Also covers a customer who paid and closed the page before it could confirm.
      const result = await checkoutSessionRepository.completePayment(payment.order_id, payment.id);
      if (!result) {
        console.error(`[Payments] Payment ${payment.id} doesn't match any checkout. Razorpay order: ${payment.order_id}`);
      } else if (result.created) {
        await sendPaidOrderEmail(result.orderId);
      }
    } else if (typeof eventType === 'string' && eventType.startsWith('refund.')) {
      await refundService.handleWebhook(eventType, event.payload.refund.entity);
    }

    return { received: true };
  },
};
