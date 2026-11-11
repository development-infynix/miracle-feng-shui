import { beforeEach, describe, it, expect, vi } from 'vitest';
import crypto from 'crypto';
import { paymentService } from '@/server/services/payment.service';
import { orderRepository } from '@/server/repositories/order.repository';
import { checkoutSessionRepository } from '@/server/repositories/checkout-session.repository';
import { cartRepository } from '@/server/repositories/cart.repository';
import { productRepository } from '@/server/repositories/product.repository';
import { userRepository } from '@/server/repositories/user.repository';
import { emailService } from '@/server/services/email.service';
import { notificationService } from '@/server/services/notification.service';
import { settingsService } from '@/server/services/settings.service';

const createRazorpayOrder = vi.hoisted(() => vi.fn());
const fetchPayment = vi.hoisted(() => vi.fn());
vi.mock('@/lib/razorpay', () => ({ razorpay: { orders: { create: createRazorpayOrder }, payments: { fetch: fetchPayment } } }));

const sign = (text: string, secret: string) => crypto.createHmac('sha256', secret).update(text).digest('hex');

const paidOrder = {
  id: 'o1',
  userId: 'user-1',
  orderNumber: 'MFS-1',
  status: 'PAID',
  paymentMethod: 'RAZORPAY',
  paymentStatus: 'PAID',
  total: 5000,
  shippingAddress: {},
  razorpayOrderId: 'order_1',
  razorpayPaymentId: 'pay_1',
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
  user: { id: 'user-1', name: 'Test', email: 't@example.com', phone: null },
} as any;

describe('PaymentService', () => {
  describe('verifying a payment', () => {
    const verify = (userId = 'user-1', signature = sign('order_1|pay_1', 'secret')) =>
      paymentService.verifyPayment(userId, {
        razorpay_order_id: 'order_1',
        razorpay_payment_id: 'pay_1',
        razorpay_signature: signature,
      });

    beforeEach(() => {
      vi.restoreAllMocks();
      process.env.RAZORPAY_KEY_SECRET = 'secret';
      vi.spyOn(checkoutSessionRepository, 'findOwner').mockResolvedValue('user-1');
      vi.spyOn(checkoutSessionRepository, 'findSession').mockResolvedValue({ razorpayOrderId: 'order_1', total: 5000 });
      fetchPayment.mockReset().mockResolvedValue({ status: 'captured', amount: 500000, currency: 'INR' });
      vi.spyOn(checkoutSessionRepository, 'completePayment').mockResolvedValue({ orderId: 'o1', created: true });
      vi.spyOn(orderRepository, 'findById').mockResolvedValue(paidOrder);
      vi.spyOn(emailService, 'sendOrderConfirmationEmail').mockResolvedValue({ success: true });
      vi.spyOn(notificationService, 'notify').mockImplementation(() => {});
    });

    it('writes the paid order, emails the customer and notifies them', async () => {
      const verified = await verify();

      expect(checkoutSessionRepository.completePayment).toHaveBeenCalledWith('order_1', 'pay_1');
      expect(verified.status).toBe('PAID');
      expect(verified.paymentStatus).toBe('PAID');
      expect(emailService.sendOrderConfirmationEmail).toHaveBeenCalledTimes(1);
      expect(notificationService.notify).toHaveBeenCalledTimes(1);
      expect(notificationService.notify).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ title: 'Order MFS-1 is confirmed', link: '/profile?tab=orders&order=MFS-1' })
      );
    });

    it('writes nothing when the signature is wrong', async () => {
      await expect(verify('user-1', 'invalid_tampered_signature')).rejects.toThrow('Invalid Razorpay payment signature');
      expect(checkoutSessionRepository.completePayment).not.toHaveBeenCalled();
    });

    it('writes nothing when the captured amount does not match the session total', async () => {
      fetchPayment.mockResolvedValue({ status: 'captured', amount: 100, currency: 'INR' });
      await expect(verify()).rejects.toThrow('Payment amount does not match the order total');
      expect(checkoutSessionRepository.completePayment).not.toHaveBeenCalled();
    });

    it("writes nothing for another customer's payment", async () => {
      await expect(verify('user-2')).rejects.toThrow('does not belong');
      expect(checkoutSessionRepository.completePayment).not.toHaveBeenCalled();
    });

    it('writes nothing for a payment the store has no record of', async () => {
      vi.spyOn(checkoutSessionRepository, 'findOwner').mockResolvedValue(null);
      await expect(verify()).rejects.toThrow('Order not found');
      expect(checkoutSessionRepository.completePayment).not.toHaveBeenCalled();
    });

    it('does not email or notify again when the webhook already wrote the order', async () => {
      vi.spyOn(checkoutSessionRepository, 'completePayment').mockResolvedValue({ orderId: 'o1', created: false });
      await verify();
      expect(emailService.sendOrderConfirmationEmail).not.toHaveBeenCalled();
      expect(notificationService.notify).not.toHaveBeenCalled();
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
      vi.spyOn(checkoutSessionRepository, 'orderNumberTaken').mockResolvedValue(false);
      vi.spyOn(checkoutSessionRepository, 'deleteExpired').mockResolvedValue({ count: 0 });
      vi.spyOn(checkoutSessionRepository, 'create').mockResolvedValue({} as any);
      vi.spyOn(settingsService, 'isCancellationAllowed').mockResolvedValue(true);
    });

    it('records the store’s cancellation setting on the checkout, for the order to keep', async () => {
      createRazorpayOrder.mockResolvedValue({ id: 'order_real' });
      vi.spyOn(settingsService, 'isCancellationAllowed').mockResolvedValue(false);

      await paymentService.createRazorpayOrder('user-1', input);

      expect(checkoutSessionRepository.create).toHaveBeenCalledWith(expect.objectContaining({ cancellationAllowed: false }));
    });

    it('saves nothing and invents no id when Razorpay refuses', async () => {
      createRazorpayOrder.mockRejectedValue(new Error('auth failed'));

      await expect(paymentService.createRazorpayOrder('user-1', input)).rejects.toThrow('could not start the payment');
      expect(checkoutSessionRepository.create).not.toHaveBeenCalled();
    });

    it('charges the server total in paise, and writes no order before payment', async () => {
      createRazorpayOrder.mockResolvedValue({ id: 'order_real' });
      const createOrder = vi.spyOn(orderRepository, 'create');

      const result = await paymentService.createRazorpayOrder('user-1', input);

      expect(createRazorpayOrder.mock.calls[0][0]).toMatchObject({ amount: 20000, currency: 'INR' });
      expect(result.razorpayOrderId).toBe('order_real');
      expect(result).not.toHaveProperty('orderId');
      expect(createOrder).not.toHaveBeenCalled();
      expect(checkoutSessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ razorpayOrderId: 'order_real', userId: 'user-1', total: 200 })
      );
    });

    it('refuses a product that has been hidden', async () => {
      vi.spyOn(productRepository, 'findById').mockResolvedValue({ id: 'p1', isActive: false } as any);

      await expect(paymentService.createRazorpayOrder('user-1', input)).rejects.toThrow('no longer available');
      expect(createRazorpayOrder).not.toHaveBeenCalled();
    });

    it('refuses a paused product, which is still shown but cannot be bought', async () => {
      vi.spyOn(productRepository, 'findById').mockResolvedValue({
        id: 'p1', title: 'Bell', price: 100, stock: 5, isActive: true, isPaused: true, images: [],
      } as any);

      await expect(paymentService.createRazorpayOrder('user-1', input)).rejects.toThrow('currently unavailable');
      expect(createRazorpayOrder).not.toHaveBeenCalled();
    });
  });

  describe('the webhook', () => {
    const body = (event: string) =>
      JSON.stringify({ event, payload: { payment: { entity: { id: 'pay_1', order_id: 'order_1' } } } });

    beforeEach(() => {
      vi.restoreAllMocks();
      process.env.RAZORPAY_WEBHOOK_SECRET = 'hook';
      process.env.RAZORPAY_KEY_SECRET = 'api';
      vi.spyOn(checkoutSessionRepository, 'findSession').mockResolvedValue({ razorpayOrderId: 'order_1', total: 5000 });
      fetchPayment.mockReset().mockResolvedValue({ status: 'captured', amount: 500000, currency: 'INR' });
      vi.spyOn(orderRepository, 'findById').mockResolvedValue(paidOrder);
      vi.spyOn(emailService, 'sendOrderConfirmationEmail').mockResolvedValue({ success: true });
    });

    it('does not accept the API secret as the webhook secret', async () => {
      const raw = body('payment.captured');
      await expect(paymentService.handleWebhook(raw, sign(raw, 'api'))).rejects.toThrow('Invalid webhook signature');
    });

    it('writes the order from a captured payment and emails the customer once', async () => {
      const complete = vi
        .spyOn(checkoutSessionRepository, 'completePayment')
        .mockResolvedValueOnce({ orderId: 'o1', created: true })
        .mockResolvedValueOnce({ orderId: 'o1', created: false });
      const raw = body('payment.captured');

      await paymentService.handleWebhook(raw, sign(raw, 'hook'));
      await paymentService.handleWebhook(raw, sign(raw, 'hook'));

      expect(complete).toHaveBeenCalledWith('order_1', 'pay_1');
      expect(emailService.sendOrderConfirmationEmail).toHaveBeenCalledTimes(1);
    });

    it('logs a captured payment with no matching checkout, without failing', async () => {
      vi.spyOn(checkoutSessionRepository, 'findSession').mockResolvedValue(null);
      vi.spyOn(checkoutSessionRepository, 'completePayment').mockResolvedValue(null);
      const log = vi.spyOn(console, 'error').mockImplementation(() => {});
      const raw = body('payment.captured');

      await expect(paymentService.handleWebhook(raw, sign(raw, 'hook'))).resolves.toEqual({ received: true });
      expect(log).toHaveBeenCalled();
    });

    it('writes nothing when a payment attempt fails', async () => {
      const complete = vi.spyOn(checkoutSessionRepository, 'completePayment');
      const raw = body('payment.failed');

      await paymentService.handleWebhook(raw, sign(raw, 'hook'));

      expect(complete).not.toHaveBeenCalled();
    });
  });
});
