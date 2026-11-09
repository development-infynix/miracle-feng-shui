import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().trim().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});


const PHONE_PATTERN = /^\+?[\d\s-]{7,20}$/;

/** Only these fields can change. Anything else sent, including an email, is dropped. */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || PHONE_PATTERN.test(value), 'Enter a valid phone number')
    .optional(),
});

export const verifyPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z.string().trim().min(6, 'New password must be at least 6 characters'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
