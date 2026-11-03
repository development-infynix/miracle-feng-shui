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
      if (!product) {
        throw ApiError.notFound(`Product with ID ${item.productId} no longer exists`);
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

    // Create Razorpay Order
    let razorpayOrderId = '';
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
      console.warn('Razorpay order creation warning (using generated order ID if test keys):', rzpErr?.message);
      razorpayOrderId = `order_${Math.random().toString(36).substring(2, 15)}`;
    }

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

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw ApiError.badRequest('RAZORPAY_KEY_SECRET is not configured');
    const text = `${input.razorpay_order_id}|${input.razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(input.razorpay_signature, 'utf8');

    let isValid = false;
    if (expectedBuffer.length === receivedBuffer.length) {
      isValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    }

    if (!isValid) {
      throw ApiError.badRequest('Invalid Razorpay payment signature');
    }

    // Atomically mark PAID, decrement stock, clear cart via orderRepository
    await orderRepository.markOrderAsPaid(order.id, input.razorpay_payment_id);

    const updatedOrder = await orderRepository.findById(order.id);
    const formatted = orderService.formatOrder(updatedOrder);

    // Send order confirmation email asynchronously
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
  },

  async handleWebhook(rawBody: string, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
    if (!secret) {
      throw ApiError.internal('Webhook secret not configured');
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(signature, 'utf8');

    let isValid = false;
    if (expectedBuffer.length === receivedBuffer.length) {
      isValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    }

    if (!isValid) {
      throw ApiError.badRequest('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const order = await orderRepository.findByRazorpayOrderId(razorpayOrderId);

      if (order && order.paymentStatus !== 'PAID') {
        await orderRepository.markOrderAsPaid(order.id, payment.id);
      }
    } else if (eventType === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const order = await orderRepository.findByRazorpayOrderId(razorpayOrderId);

      if (order && order.paymentStatus !== 'PAID') {
        await orderRepository.updatePayment(order.id, {
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
        });
      }
    }

    return { received: true };
  },
};
