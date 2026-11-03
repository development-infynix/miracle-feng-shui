import { cartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { AddToCartInput } from '../validators/cart.validator';
import { ApiError } from '../utils/ApiError';
import { productService } from './product.service';

export const cartService = {
  async getCart(userId: string) {
    const cart = await cartRepository.findOrCreateCart(userId);
    let subtotal = 0;
    let savings = 0;

    const formattedItems = cart.items.map((item) => {
      const formattedProd = productService.formatProduct(item.product);
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;

      if (item.product.comparePrice && item.product.comparePrice > item.product.price) {
        savings += (item.product.comparePrice - item.product.price) * item.quantity;
      }

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        selectedVariations: item.selectedVariations as Record<string, string> | undefined,
        personalizationText: item.personalizationText || undefined,
        isGift: item.isGift,
        product: formattedProd,
        itemTotal,
      };
    });

    return {
      id: cart.id,
      userId: cart.userId,
      items: formattedItems,
      count: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal,
      savings,
    };
  },

  async addItem(userId: string, input: AddToCartInput) {
    const product = await productRepository.findBySlugOrId(input.productId);
    if (!product || !product.isActive) {
      throw ApiError.notFound('Product not found or currently unavailable');
    }

    if (product.stock < input.quantity) {
      throw ApiError.badRequest(`Only ${product.stock} items available in stock`);
    }

    const cart = await cartRepository.findOrCreateCart(userId);
    await cartRepository.addItem(cart.id, input);
    return this.getCart(userId);
  },

  async updateItemQty(userId: string, itemId: string, quantity: number) {
    const cart = await cartRepository.findOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw ApiError.notFound('Cart item not found');
    }

    if (item.product.stock < quantity) {
      throw ApiError.badRequest(`Only ${item.product.stock} items available in stock`);
    }

    await cartRepository.updateItemQty(cart.id, itemId, quantity);
    return this.getCart(userId);
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await cartRepository.findOrCreateCart(userId);
    await cartRepository.removeItem(cart.id, itemId);
    return this.getCart(userId);
  },

  async clearCart(userId: string) {
    const cart = await cartRepository.findOrCreateCart(userId);
    await cartRepository.clearCart(cart.id);
    return { success: true, count: 0, subtotal: 0, items: [] };
  },
};
