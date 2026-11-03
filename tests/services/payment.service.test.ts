import { describe, it, expect, vi } from 'vitest';
import crypto from 'crypto';
import { paymentService } from '@/server/services/payment.service';
import { orderRepository } from '@/server/repositories/order.repository';

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

    vi.spyOn(orderRepository, 'markOrderAsPaid').mockResolvedValueOnce({} as any);

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
});
