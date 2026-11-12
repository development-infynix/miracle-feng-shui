import { z } from 'zod';

export const adminProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  q: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  lowStock: z.stringbool().optional(),
  /** The Status filter on the Products page. "active" means for sale (not paused). */
  tag: z.enum(['active', 'paused', 'freeShipping', 'bestseller']).optional(),
});

export type AdminProductQueryInput = z.infer<typeof adminProductQuerySchema>;

// Load-more paging for the customer drawer's lists. The max keeps `skip` a safe integer.
export const customerListQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(1_000_000).default(1),
});

// Shared rules with no defaults. Defaults belong only to creation: Zod still applies them to
// fields made optional by `.partial()`, which would overwrite stored values on every update.
const productFields = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  name: z.string().optional(), // alias for title
  slug: z.string().optional(),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  comparePrice: z.coerce.number().min(0).nullable().optional(),
  originalPrice: z.coerce.number().min(0).nullable().optional(), // alias for comparePrice
  categoryId: z.string().min(1, 'Category is required'),
  category: z.string().optional(), // alias for categoryId
  stock: z.coerce.number().int().min(0),
  images: z.array(z.string()).min(1, 'At least one product image is required'),
  maker: z.string().optional(),
  makerLocation: z.string().optional(),
  makerAvatar: z.string().optional(),
  makerSales: z.coerce.number().int().optional(),
  salesCount: z.coerce.number().int().optional(), // alias for makerSales
  starSeller: z.boolean().optional(),
  bestseller: z.boolean().optional(),
  etsyPick: z.boolean().optional(),
  freeShipping: z.boolean().optional(),
  readyToShip: z.boolean().optional(),
  returnsAccepted: z.boolean().optional(),
  discount: z.string().nullable().optional(),
  itemDetails: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(), // alias for itemDetails
  materials: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  variations: z.any().optional(),
  allowsPersonalization: z.boolean().optional(),
  personalizationRequired: z.boolean().optional(), // alias for allowsPersonalization
  personalizationPrompt: z.string().nullable().optional(),
  personalizationInstruction: z.string().nullable().optional(), // alias
  inDemandCount: z.coerce.number().int().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  isActive: z.boolean().optional(),
  isPaused: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  showStockLeft: z.boolean().optional(),
});

export const createProductSchema = productFields.extend({
  stock: z.coerce.number().int().min(0).default(10),
  maker: z.string().optional().default('Miracle Feng Shui Studio'),
  makerSales: z.coerce.number().int().optional().default(0),
  starSeller: z.boolean().optional().default(false),
  bestseller: z.boolean().optional().default(false),
  etsyPick: z.boolean().optional().default(false),
  freeShipping: z.boolean().optional().default(true),
  readyToShip: z.boolean().optional().default(true),
  returnsAccepted: z.boolean().optional().default(true),
  itemDetails: z.array(z.string()).optional().default([]),
  materials: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  allowsPersonalization: z.boolean().optional().default(false),
  inDemandCount: z.coerce.number().int().optional().default(0),
  rating: z.coerce.number().min(0).max(5).optional().default(0),
  isActive: z.boolean().optional().default(true),
  isPaused: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  showStockLeft: z.boolean().optional().default(false),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = productFields.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.string().transform((val) => val.toUpperCase().replace(/ /g, '_')).pipe(
    z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLATION_REQUESTED', 'CANCELLATION_APPROVED', 'CANCELLED'])
  ),
  /** Why the store cancelled it. Shown to the customer and kept in the order's history. */
  note: z.string().trim().max(300, 'Keep the reason under 300 characters').optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

/** Deactivate (active: false) or reactivate (active: true) a customer account. */
export const setCustomerActiveSchema = z.object({ active: z.boolean() });

/** Archive (archived: true) or restore (archived: false) a finished order. */
export const setOrderArchivedSchema = z.object({ archived: z.boolean() });
