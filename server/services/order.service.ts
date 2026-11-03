import { orderRepository } from '../repositories/order.repository';
import { cartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { CreateOrderInput } from '../validators/order.validator';
import { ApiError } from '../utils/ApiError';
import { OrderStatus, PaymentMethod } from '@/app/generated/prisma/client';
import { emailService } from './email.service';

export const orderService = {
  formatOrder(order: any) {
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    const address = order.shippingAddress as any;
    const addressStr = address
      ? typeof address === 'string'
        ? address
        : [
            address.line1,
            address.line2,
            address.city,
            address.state ? `${address.state} - ${address.pincode || ''}` : address.pincode,
            address.country || 'India',
          ]
            .filter(Boolean)
            .join(', ')
      : '';

    const rawDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const deliveryStart = new Date(rawDate);
    deliveryStart.setDate(rawDate.getDate() + 4);
    const deliveryEnd = new Date(rawDate);
    deliveryEnd.setDate(rawDate.getDate() + 7);

    const isDelivered = order.status === 'DELIVERED';
    const estimatedDelivery = isDelivered
      ? `Delivered on ${deliveryEnd.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : `Arriving ${deliveryStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}–${deliveryEnd.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const digitsOnly = (order.orderNumber || order.id || '').replace(/[^0-9]/g, '') || '984210984';
    const trackingNumber = order.trackingNumber || `IND${digitsOnly.padEnd(9, '0').slice(0, 9)}IN`;

    return {
      id: order.id,
      orderNumber: order.orderNumber || `MFS-${order.id?.slice(-6).toUpperCase() || '100000'}`,
      date: rawDate.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      customerName: address?.name || order.user?.name || 'Valued Customer',
      email: address?.email || order.user?.email || '',
      phone: address?.phone || order.user?.phone || '',
      address: addressStr,
      shippingAddress: addressStr,
      city: address?.city || '',
      state: address?.state || '',
      pincode: address?.pincode || '',
      total: order.total,
      totalAmount: order.total,
      paymentMethod:
        order.paymentMethod === 'COD'
          ? 'Cash on Delivery'
          : order.paymentMethod === 'RAZORPAY'
          ? 'UPI / Online Payment'
          : order.paymentMethod || 'Online Payment',
      paymentStatus: order.paymentStatus || (order.paymentMethod === 'COD' ? 'Pending (COD)' : 'Paid'),
      status: order.status,
      courier: order.courier || 'BlueDart Express',
      trackingNumber,
      estimatedDelivery,
      shopName: 'Miracle Feng Shui Studio',
      createdAt: order.createdAt,
      items: (order.items || []).map((item: any) => {
        const prod = item.product;
        const img = item.image || prod?.images?.[0] || '/images/miracle.jpeg';
        return {
          id: item.id,
          productId: item.productId,
          productName: item.title || prod?.title || 'Feng Shui Sacred Item',
          title: item.title || prod?.title || 'Feng Shui Sacred Item',
          name: item.title || prod?.title || 'Feng Shui Sacred Item',
          price: item.price ?? prod?.price ?? 0,
          quantity: item.quantity || 1,
          image: img,
          images: prod?.images?.length ? prod.images : [img],
          selectedVariations: item.selectedVariations,
          personalizationText: item.personalizationText,
          slug: prod?.slug || item.productId,
          product: prod
            ? {
                ...prod,
                name: prod.title,
                images: prod.images?.length ? prod.images : [img],
              }
            : {
                id: item.productId,
                title: item.title,
                name: item.title,
                price: item.price,
                images: [img],
                maker: 'Miracle Feng Shui Studio',
                slug: item.productId,
              },
        };
      }),
    };
  },

  async createFromCart(userId: string, input: CreateOrderInput) {
    const cart = await cartRepository.findOrCreateCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw ApiError.badRequest('Cannot place an order with an empty cart');
    }

    // Validate stock and calculate total server-side
    let calculatedTotal = 0;
    const orderItemsData: {
      productId: string;
      title: string;
      price: number;
      quantity: number;
      image: string;
      selectedVariations?: any;
      personalizationText?: string;
    }[] = [];

    for (const item of cart.items) {
      const product = await productRepository.findBySlugOrId(item.productId);
      if (!product || !product.isActive) {
        throw ApiError.badRequest(`Product "${item.product.title}" is no longer available`);
      }

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for "${product.title}". Available: ${product.stock}, requested: ${item.quantity}`
        );
      }

      const itemPrice = product.price;
      calculatedTotal += itemPrice * item.quantity;

      orderItemsData.push({
        productId: product.id,
        title: product.title,
        price: itemPrice,
        quantity: item.quantity,
        image: product.images[0] || '',
        selectedVariations: item.selectedVariations,
        personalizationText: item.personalizationText || undefined,
      });
    }

    const orderNumber = `MFS-${Math.floor(100000 + Math.random() * 900000)}`;
    const isCod = input.paymentMethod === 'COD';
    const initialStatus: OrderStatus = isCod ? 'COD_PENDING' : 'PENDING';

    const order = await orderRepository.createOrderWithStockUpdate(
      {
        orderNumber,
        userId,
        status: initialStatus,
        paymentMethod: input.paymentMethod as PaymentMethod,
        paymentStatus: 'PENDING',
        total: calculatedTotal,
        shippingAddress: input.shippingAddress,
        items: orderItemsData,
      },
      isCod
    );

    const fullOrder = await orderRepository.findById(order.id);
    const formatted = this.formatOrder(fullOrder);

    // Send order confirmation email asynchronously
    emailService
      .sendOrderConfirmationEmail({
        orderNumber: formatted.orderNumber,
        customerName: formatted.customerName,
        email: formatted.email,
        phone: formatted.phone,
        address: formatted.address,
        paymentMethod: formatted.paymentMethod,
        paymentStatus: formatted.paymentStatus,
        totalAmount: formatted.totalAmount,
        items: formatted.items,
        date: formatted.date,
      })
      .catch((err) => console.error('[OrderService] Email dispatch failed:', err));

    return formatted;
  },

  async getUserOrders(userId: string) {
    const orders = await orderRepository.findUserOrders(userId);
    return orders.map(this.formatOrder);
  },

  async getOrderById(orderId: string, userId: string, userRole: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (userRole !== 'ADMIN' && order.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to view this order');
    }

    return this.formatOrder(order);
  },
};
