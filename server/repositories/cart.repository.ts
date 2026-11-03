import prisma from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma/client';
import { AddToCartInput } from '../validators/cart.validator';

export const cartRepository = {
  async findOrCreateCart(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    let cart = await client.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await client.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    return cart;
  },

  async addItem(cartId: string, input: AddToCartInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const existing = await client.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId: input.productId,
        },
      },
    });

    if (existing) {
      return client.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + input.quantity,
          selectedVariations: input.selectedVariations ?? undefined,
          personalizationText: input.personalizationText ?? undefined,
          isGift: input.isGift ?? undefined,
        },
        include: { product: true },
      });
    }

    return client.cartItem.create({
      data: {
        cartId,
        productId: input.productId,
        quantity: input.quantity,
        selectedVariations: input.selectedVariations ?? undefined,
        personalizationText: input.personalizationText ?? undefined,
        isGift: input.isGift ?? false,
      },
      include: { product: true },
    });
  },

  async updateItemQty(
    cartId: string,
    itemId: string,
    quantity: number,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.cartItem.updateMany({
      where: { id: itemId, cartId },
      data: { quantity },
    });
  },

  async removeItem(cartId: string, itemId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.cartItem.deleteMany({
      where: { id: itemId, cartId },
    });
  },

  async clearCart(cartId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.cartItem.deleteMany({
      where: { cartId },
    });
  },
};
