import { z } from 'zod';

export const adminProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  q: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  lowStock: z.coerce.boolean().optional(),
});

export type AdminProductQueryInput = z.infer<typeof adminProductQuerySchema>;

export const createProductSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  name: z.string().optional(), // alias for title
  slug: z.string().optional(),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  comparePrice: z.coerce.number().min(0).nullable().optional(),
  originalPrice: z.coerce.number().min(0).nullable().optional(), // alias for comparePrice
  categoryId: z.string().min(1, 'Category is required'),
  category: z.string().optional(), // alias for categoryId
  stock: z.coerce.number().int().min(0).default(10),
  images: z.array(z.string()).min(1, 'At least one product image is required'),
  maker: z.string().optional().default('Miracle Feng Shui Studio'),
  makerLocation: z.string().optional(),
  makerAvatar: z.string().optional(),
  makerSales: z.coerce.number().int().optional().default(0),
  salesCount: z.coerce.number().int().optional(), // alias for makerSales
  starSeller: z.boolean().optional().default(false),
  bestseller: z.boolean().optional().default(false),
  etsyPick: z.boolean().optional().default(false),
  freeShipping: z.boolean().optional().default(true),
  readyToShip: z.boolean().optional().default(true),
  returnsAccepted: z.boolean().optional().default(true),
  discount: z.string().nullable().optional(),
  itemDetails: z.array(z.string()).optional().default([]),
  highlights: z.array(z.string()).optional(), // alias for itemDetails
  materials: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  variations: z.any().optional(),
  allowsPersonalization: z.boolean().optional().default(false),
  personalizationRequired: z.boolean().optional(), // alias for allowsPersonalization
  personalizationPrompt: z.string().nullable().optional(),
  personalizationInstruction: z.string().nullable().optional(), // alias
  inDemandCount: z.coerce.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.string().transform((val) => val.toUpperCase()).pipe(
    z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  ),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const updateHomepageSectionSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      sectionKey: z.string().optional(),
      name: z.string().optional(),
      title: z.string().optional(),
      subtitle: z.string().nullable().optional(),
      ctaText: z.string().nullable().optional(),
      ctaLink: z.string().nullable().optional(),
      badge: z.string().nullable().optional(),
      order: z.number().int().optional(),
      enabled: z.boolean().optional(),
    })
  ),
});

export type UpdateHomepageSectionInput = z.infer<typeof updateHomepageSectionSchema>;
