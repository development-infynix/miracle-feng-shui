import { describe, it, expect, vi } from 'vitest';
import { orderService } from '@/server/services/order.service';
import { cartRepository } from '@/server/repositories/cart.repository';
import { productRepository } from '@/server/repositories/product.repository';
import { orderRepository } from '@/server/repositories/order.repository';

describe('OrderService', () => {
  it('should reject order creation if user cart is empty', async () => {
    vi.spyOn(cartRepository, 'findOrCreateCart').mockResolvedValueOnce({
      id: 'cart-1',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });

    await expect(
      orderService.createFromCart('user-1', {
        shippingAddress: {
          name: 'Pooja',
          phone: '+91 99999 88888',
          line1: '123 Peace St',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India',
        },
        paymentMethod: 'COD',
      })
    ).rejects.toThrow('Cannot place an order with an empty cart');
  });

  it('should validate stock and calculate server-side totals for Cash on Delivery', async () => {
    vi.spyOn(cartRepository, 'findOrCreateCart').mockResolvedValueOnce({
      id: 'cart-1',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'item-1',
          cartId: 'cart-1',
          productId: 'prod-1',
          quantity: 2,
          selectedVariations: null,
          personalizationText: null,
          isGift: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: 'prod-1',
            title: 'Five Emperor Coins Talisman',
            price: 1500,
            stock: 10,
            images: ['https://example.com/coin.jpg'],
          } as any,
        },
      ],
    });

    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValueOnce({
      id: 'prod-1',
      title: 'Five Emperor Coins Talisman',
      price: 1500,
      stock: 10,
      images: ['https://example.com/coin.jpg'],
      category: { name: 'Coins', slug: 'coins' },
      isActive: true,
    } as any);

    const mockDbOrder = {
      id: 'ord-db-123',
      orderNumber: 'MFS-888999',
      userId: 'user-1',
      status: 'COD_PENDING',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      total: 3000,
      shippingAddress: {
        name: 'Pooja',
        phone: '+91 99999 88888',
        line1: '123 Peace St',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India',
      },
      razorpayOrderId: null,
      razorpayPaymentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'item-1',
          orderId: 'ord-db-123',
          productId: 'prod-1',
          title: 'Five Emperor Coins Talisman',
          price: 1500,
          quantity: 2,
          image: 'https://example.com/coin.jpg',
          selectedVariations: null,
          personalizationText: null,
        },
      ],
    };

    vi.spyOn(orderRepository, 'createOrderWithStockUpdate').mockResolvedValueOnce(mockDbOrder as any);
    vi.spyOn(orderRepository, 'findById').mockResolvedValueOnce(mockDbOrder as any);

    const order = await orderService.createFromCart('user-1', {
      shippingAddress: {
        name: 'Pooja',
        phone: '+91 99999 88888',
        line1: '123 Peace St',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India',
      },
      paymentMethod: 'COD',
    });

    expect(order.id).toBe('ord-db-123');
    expect(order.totalAmount).toBe(3000); // 1500 * 2
    expect(order.paymentMethod).toBe('Cash on Delivery');
  });
});
