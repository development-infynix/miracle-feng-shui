import { describe, expect, it } from 'vitest';
import {
  adminProductQuerySchema,
  createProductSchema,
  updateProductSchema,
} from '@/server/validators/admin.validator';

describe('adminProductQuerySchema', () => {
  it('reads lowStock as the value it was given', () => {
    expect(adminProductQuerySchema.parse({ lowStock: 'false' }).lowStock).toBe(false);
    expect(adminProductQuerySchema.parse({ lowStock: 'true' }).lowStock).toBe(true);
    expect(adminProductQuerySchema.parse({}).lowStock).toBeUndefined();
  });
});

describe('updateProductSchema', () => {
  it('keeps only the fields that were sent', () => {
    expect(updateProductSchema.parse({ title: 'New name' })).toEqual({ title: 'New name' });
  });

  it('returns nothing for an empty update', () => {
    expect(updateProductSchema.parse({})).toEqual({});
  });

  it('keeps false, zero and empty values that were sent on purpose', () => {
    const input = { isActive: false, freeShipping: false, stock: 0, tags: [] };
    expect(updateProductSchema.parse(input)).toEqual(input);
  });

  it('still validates the fields that were sent', () => {
    expect(() => updateProductSchema.parse({ title: 'x' })).toThrow();
    expect(() => updateProductSchema.parse({ price: -1 })).toThrow();
    expect(() => updateProductSchema.parse({ images: [] })).toThrow();
  });
});

describe('createProductSchema', () => {
  const required = {
    title: 'Jade Buddha',
    description: 'A hand-carved statue',
    price: 100,
    categoryId: 'cat-1',
    images: ['/image.jpg'],
  };

  it('still applies defaults to a new product', () => {
    expect(createProductSchema.parse(required)).toMatchObject({
      stock: 10,
      maker: 'Miracle Feng Shui Studio',
      makerSales: 0,
      starSeller: false,
      bestseller: false,
      etsyPick: false,
      freeShipping: true,
      itemDetails: [],
      materials: [],
      tags: [],
      allowsPersonalization: false,
      inDemandCount: 0,
      isActive: true,
      isFeatured: false,
    });
  });

  it('still requires the core fields', () => {
    expect(() => createProductSchema.parse({ title: 'Jade Buddha' })).toThrow();
  });
});
