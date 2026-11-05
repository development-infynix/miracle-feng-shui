import { z } from 'zod';

const addressFields = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().min(5, 'Phone number is required'),
  line1: z.string().trim().min(3, 'Address line 1 is required'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pincode: z.string().trim().min(4, 'Pincode is required'),
  country: z.string().trim().min(1, 'Country is required'),
  type: z.enum(['Home', 'Office', 'Other']),
  isDefault: z.boolean(),
});

export const addressSchema = addressFields.extend({
  country: addressFields.shape.country.default('India'),
  type: addressFields.shape.type.default('Home'),
  isDefault: addressFields.shape.isDefault.default(false),
});

// No defaults here, so changing one field can't reset the others.
export const updateAddressSchema = addressFields.partial();

export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
