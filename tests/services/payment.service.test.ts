import { beforeEach, describe, it, expect, vi } from 'vitest';
import crypto from 'crypto';
import { paymentService } from '@/server/services/payment.service';
import { orderRepository } from '@/server/repositories/order.repository';
import { cartRepository } from '@/server/repositories/cart.repository';
import { productRepository } from '@/server/repositories/product.repository';
import { userRepository } from '@/server/repositories/user.repository';
import { emailService } from '@/server/services/email.service';

const createRazorpayOrder = vi.hoisted(() => vi.fn());
vi.mock('@/lib/razorpay', () => ({ razorpay: { orders: { create: createRazorpayOrder } } }));

describe('PaymentService', () => {
  it('should verify correct Razorpay HMAC-SHA256 signatures', async () => {
    const orderId = 'test-order-1';
    const razorpayOrderId = 'order_test_12345';
    const razorpayPaymentId = 'pay_test_67890';
    const secret = 'test_secret_for_unit_tests';
    process.env.RAZORPAY_KEY_SECRET = secret;

    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const validSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');

    vi.spyOn(orderRepository, 'findById').mockResolvedValueOnce({
      id: orderId,
      userId: 'user-1',
      orderNumber: 'MFS-123456',
      status: 'PENDING',
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PENDING',
      total: 1999,
      shippingAddress: {},
      razorpayOrderId,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      user: { id: 'user-1', name: 'Test User', email: 'test@example.com', phone: null },
    } as any);

    vi.spyOn(orderRepository, 'markOrderAsPaid').mockResolvedValueOnce(true);

    vi.spyOn(orderRepository, 'findById').mockResolvedValueOnce({
      id: orderId,
      userId: 'user-1',
      orderNumber: 'MFS-123456',
      status: 'PAID',
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
      total: 1999,
      shippingAddress: {},
      razorpayOrderId,
      razorpayPaymentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      user: { id: 'user-1', name: 'Test User', email: 'test@example.com', phone: null },
    } as any);

    const verified = await paymentService.verifyPayment('user-1', {
      orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: validSignature,
    });

    expect(verified).toBeDefined();
    expect(verified.status).toBe('PAID');
  });

  it('should reject invalid Razorpay payment signatures', async () => {
    const orderId = 'test-order-1';
    const razorpayOrderId = 'order_test_12345';
    const razorpayPaymentId = 'pay_test_67890';
    const fakeSignature = 'invalid_tampered_signature_hex';

    vi.spyOn(orderRepository, 'findById').mockResolvedValueOnce({
      id: orderId,
      userId: 'user-1',
      orderNumber: 'MFS-123456',
      status: 'PENDING',
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PENDING',
      total: 1999,
      shippingAddress: {},
      razorpayOrderId,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      user: { id: 'user-1', name: 'Test User', email: 'test@example.com', phone: null },
    } as any);

    await expect(
      paymentService.verifyPayment('user-1', {
        orderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: fakeSignature,
      })
    ).rejects.toThrow('Invalid Razorpay payment signature');
  });

  const sign = (text: string, secret: string) => crypto.createHmac('sha256', secret).update(text).digest('hex');
  const pendingOrder = {
    id: 'o1',
    userId: 'user-1',
    orderNumber: 'MFS-1',
    status: 'PENDING',
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PENDING',
    total: 5000,
    shippingAddress: {},
    razorpayOrderId: 'order_expensive',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    user: { id: 'user-1', name: 'Test', email: 't@example.com', phone: null },
  } as any;

  describe('verifying a payment', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      process.env.RAZORPAY_KEY_SECRET = 'secret';
    });

    it('rejects a real payment made for a different order', async () => {
      vi.spyOn(orderRepository, 'findById').mockResolvedValue(pendingOrder);
      const mark = vi.spyOn(orderRepository, 'markOrderAsPaid').mockResolvedValue(true);

      await expect(
        paymentService.verifyPayment('user-1', {
          orderId: 'o1',
          razorpay_order_id: 'order_cheap',
          razorpay_payment_id: 'pay_1',
          razorpay_signature: sign('order_cheap|pay_1', 'secret'),
        })
      ).rejects.toThrow('does not belong');
      expect(mark).not.toHaveBeenCalled();
    });

    it('does not email again when the order was already marked paid', async () => {
      vi.spyOn(orderRepository, 'findById').mockResolvedValue(pendingOrder);
      vi.spyOn(orderRepository, 'markOrderAsPaid').mockResolvedValue(false);
      const email = vi.spyOn(emailService, 'sendOrderConfirmationEmail').mockResolvedValue({ success: true });

      await paymentService.verifyPayment('user-1', {
        orderId: 'o1',
        razorpay_order_id: 'order_expensive',
        razorpay_payment_id: 'pay_1',
        razorpay_signature: sign('order_expensive|pay_1', 'secret'),
      });

      expect(email).not.toHaveBeenCalled();
    });
  });

  describe('starting a payment', () => {
    const input = { shippingAddress: { name: 'A', phone: '1' } } as any;

    beforeEach(() => {
      vi.restoreAllMocks();
      createRazorpayOrder.mockReset();
      vi.spyOn(cartRepository, 'findOrCreateCart').mockResolvedValue({
        items: [{ productId: 'p1', quantity: 2, product: { title: 'Bell' } }],
      } as any);
      vi.spyOn(userRepository, 'findById').mockResolvedValue({ email: 't@example.com' } as any);
      vi.spyOn(productRepository, 'findById').mockResolvedValue({
        id: 'p1',
        title: 'Bell',
        price: 100,
        stock: 5,
        isActive: true,
        images: [],
      } as any);
    });

    it('saves no order and invents no id when Razorpay refuses', async () => {
      createRazorpayOrder.mockRejectedValue(new Error('auth failed'));
      const create = vi.spyOn(orderRepository, 'create').mockResolvedValue({} as any);

      await expect(paymentService.createRazorpayOrder('user-1', input)).rejects.toThrow('could not start the payment');
      expect(create).not.toHaveBeenCalled();
    });

    it('charges the server total in paise and closes earlier unpaid orders', async () => {
      createRazorpayOrder.mockResolvedValue({ id: 'order_real' });
      const cancel = vi.spyOn(orderRepository, 'cancelUnpaidOnlineOrders').mockResolvedValue({ count: 1 });
      vi.spyOn(orderRepository, 'create').mockResolvedValue({ id: 'o1', orderNumber: 'MFS-1' } as any);

      const result = await paymentService.createRazorpayOrder('user-1', input);

      expect(createRazorpayOrder.mock.calls[0][0]).toMatchObject({ amount: 20000, currency: 'INR' });
      expect(result.razorpayOrderId).toBe('order_real');
      expect(cancel).toHaveBeenCalledWith('user-1');
    });

    it('refuses a product that has been hidden', async () => {
      vi.spyOn(productRepository, 'findById').mockResolvedValue({ id: 'p1', isActive: false } as any);

      await expect(paymentService.createRazorpayOrder('user-1', input)).rejects.toThrow('no longer available');
      expect(createRazorpayOrder).not.toHaveBeenCalled();
    });
  });

  describe('the webhook', () => {
    const body = (event: string) =>
      JSON.stringify({ event, payload: { payment: { entity: { id: 'pay_1', order_id: 'order_expensive' } } } });

    beforeEach(() => {
      vi.restoreAllMocks();
      process.env.RAZORPAY_WEBHOOK_SECRET = 'hook';
      process.env.RAZORPAY_KEY_SECRET = 'api';
    });

    it('does not accept the API secret as the webhook secret', async () => {
      const raw = body('payment.captured');
      await expect(paymentService.handleWebhook(raw, sign(raw, 'api'))).rejects.toThrow('Invalid webhook signature');
    });

    it('confirms a captured payment and emails the customer once', async () => {
      vi.spyOn(orderRepository, 'findByRazorpayOrderId').mockResolvedValue(pendingOrder);
      vi.spyOn(orderRepository, 'findById').mockResolvedValue(pendingOrder);
      const mark = vi.spyOn(orderRepository, 'markOrderAsPaid').mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      const email = vi.spyOn(emailService, 'sendOrderConfirmationEmail').mockResolvedValue({ success: true });
      const raw = body('payment.captured');

      await paymentService.handleWebhook(raw, sign(raw, 'hook'));
      await paymentService.handleWebhook(raw, sign(raw, 'hook'));

      expect(mark).toHaveBeenCalledTimes(2);
      expect(email).toHaveBeenCalledTimes(1);
    });

    it('keeps the order open when a payment attempt fails', async () => {
      vi.spyOn(orderRepository, 'findByRazorpayOrderId').mockResolvedValue(pendingOrder);
      const update = vi.spyOn(orderRepository, 'updatePayment').mockResolvedValue({} as any);
      const raw = body('payment.failed');

      await paymentService.handleWebhook(raw, sign(raw, 'hook'));

      expect(update).toHaveBeenCalledWith('o1', { paymentStatus: 'FAILED' });
    });
  });
});
