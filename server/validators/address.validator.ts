import { z } from 'zod';

export const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(5, 'Phone number is required'),
  line1: z.string().min(3, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(4, 'Pincode is required'),
  country: z.string().default('India'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = addressSchema.partial();

export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
