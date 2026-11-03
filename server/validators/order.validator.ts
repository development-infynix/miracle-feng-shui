import { z } from 'zod';

export const shippingAddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  line1: z.string().min(3, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(4, 'Pincode is required'),
  country: z.string().default('India'),
});

export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['RAZORPAY', 'COD']).default('RAZORPAY'),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
