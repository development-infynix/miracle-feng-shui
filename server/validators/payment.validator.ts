import { z } from 'zod';
import { shippingAddressSchema } from './order.validator';

export const createPaymentOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  razorpay_order_id: z.string().min(1, 'Razorpay Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay Signature is required'),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
