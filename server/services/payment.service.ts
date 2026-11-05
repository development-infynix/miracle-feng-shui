import crypto from 'crypto';
import { razorpay } from '@/lib/razorpay';
import { orderRepository } from '../repositories/order.repository';
import { cartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { userRepository } from '../repositories/user.repository';
import { orderService } from './order.service';
import { emailService } from './email.service';
import { CreatePaymentOrderInput, VerifyPaymentInput } from '../validators/payment.validator';
import { ApiError } from '../utils/ApiError';

function signatureMatches(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
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

    const orderNumber = `MFS-${Math.floor(100000 + Math.random() * 900000)}`;
    const amountInPaise = Math.round(total * 100);

    // No order is saved unless Razorpay accepts it, because the customer would have no way to pay.
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

    await orderRepository.cancelUnpaidOnlineOrders(userId);

    // Create DB order in PENDING status
    const dbOrder = await orderRepository.create({
      orderNumber,
      userId,
      status: 'PENDING',
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PENDING',
      total,
      shippingAddress: input.shippingAddress,
      razorpayOrderId,
      items: orderItemsData,
    });

    return {
      orderId: dbOrder.id,
      orderNumber: dbOrder.orderNumber,
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
    const order = await orderRepository.findById(input.orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.userId !== userId) {
      throw ApiError.forbidden('Unauthorized access to order');
    }

    // A valid signature only proves the payment is real, so it must also be for this order.
    if (order.paymentMethod !== 'RAZORPAY' || order.razorpayOrderId !== input.razorpay_order_id) {
      throw ApiError.badRequest('This payment does not belong to this order');
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw ApiError.internal('Online payment is not configured');
    const text = `${input.razorpay_order_id}|${input.razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');

    if (!signatureMatches(expectedSignature, input.razorpay_signature)) {
      throw ApiError.badRequest('Invalid Razorpay payment signature');
    }

    const newlyPaid = await orderRepository.markOrderAsPaid(order.id, input.razorpay_payment_id);
    if (newlyPaid) return sendPaidOrderEmail(order.id);

    // The webhook got here first, and has already sent the confirmation.
    return orderService.formatOrder(await orderRepository.findById(order.id));
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
      const razorpayOrderId = payment.order_id;
      const order = await orderRepository.findByRazorpayOrderId(razorpayOrderId);

      // Also covers a customer who paid and closed the page before it could confirm.
      if (order && (await orderRepository.markOrderAsPaid(order.id, payment.id))) {
        await sendPaidOrderEmail(order.id);
      }
    } else if (eventType === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const order = await orderRepository.findByRazorpayOrderId(razorpayOrderId);

      // The order stays open: the customer can retry a failed payment in the same payment window.
      if (order && order.paymentStatus !== 'PAID') {
        await orderRepository.updatePayment(order.id, { paymentStatus: 'FAILED' });
      }
    }

    return { received: true };
  },
};
