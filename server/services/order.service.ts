import { COD_ENABLED } from '@/lib/payment-options';
import { orderRepository } from '../repositories/order.repository';
import { checkoutSessionRepository } from '../repositories/checkout-session.repository';
import { cartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { CreateOrderInput } from '../validators/order.validator';
import { ApiError } from '../utils/ApiError';
import { OrderStatus, PaymentMethod } from '@/app/generated/prisma/client';
import { emailService } from './email.service';
import { customerTimeline } from './orderTimeline';
import { settingsService } from './settings.service';

/** Shown when an order was bought while the store didn't allow cancellation. */
export const NO_CANCELLATION_MESSAGE =
  "This order can't be cancelled: cancellation wasn't available when it was placed. If an item arrives damaged or wrong, contact us and we'll replace it.";

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
    // The real delivery date when it was recorded; orders delivered before that keep the estimate.
    const deliveredOn = order.deliveredAt ? new Date(order.deliveredAt) : deliveryEnd;
    const estimatedDelivery = isDelivered
      ? `Delivered on ${deliveredOn.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : `Arriving ${deliveryStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}–${deliveryEnd.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const requestedCancellation = Boolean(order.cancellationRequestedAt);
    // An unpaid online order has nothing to review: it closes by itself when the customer pays again.
    // Orders bought while the store didn't allow cancellation never offer it.
    const cancellationAllowed = order.cancellationAllowed !== false;
    const canCancel =
      cancellationAllowed &&
      !requestedCancellation &&
      (['PAID', 'COD_PENDING', 'PROCESSING'].includes(order.status) ||
        (order.status === 'PENDING' && order.paymentStatus === 'PAID'));

    // The customer never sees a failed attempt as finished: it's back with the owner to retry.
    const latestRefund = order.refunds?.[0];
    const refund = latestRefund
      ? {
          status: latestRefund.status === 'FAILED' ? 'REQUESTED' : latestRefund.status,
          amount: latestRefund.amountPaise / 100,
        }
      : null;
    // Only after the customer's own cancellation request is approved. An order the store cancelled
    // itself (Cancelled) is refunded by the store from the admin.
    const canRequestRefund =
      !order.refundRequestedAt &&
      !latestRefund &&
      order.status === 'CANCELLATION_APPROVED' &&
      order.paymentStatus === 'PAID' &&
      order.paymentMethod === 'RAZORPAY' &&
      Boolean(order.razorpayPaymentId);

    return {
      id: order.id,
      orderNumber: order.orderNumber || `MFS-${order.id?.slice(-6).toUpperCase() || '100000'}`,
      // Only ever sent to the order's owner or an admin; customer links use it instead of the number.
      accessToken: order.accessToken ?? null,
      timeline: customerTimeline(order),
      // The store's reason, when the store cancelled the order itself (its latest cancel by an admin).
      storeCancellationReason:
        order.status === 'CANCELLED'
          ? ([...(order.statusEvents ?? [])].reverse().find((e: any) => e.toStatus === 'CANCELLED' && e.actor === 'ADMIN')?.note ?? null)
          : null,
      // The store cancelled a paid online order itself: the store refunds it, so the customer is
      // told it's on its way rather than offered a Refund button.
      refundPending:
        order.status === 'CANCELLED' &&
        order.paymentStatus === 'PAID' &&
        order.paymentMethod === 'RAZORPAY' &&
        Boolean(order.razorpayPaymentId) &&
        latestRefund?.status !== 'PROCESSED',
      cancellationAllowed,
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
      // Only what's really been recorded: no tracking is shown until the store adds a real number.
      paymentId: order.razorpayPaymentId || null,
      tracking: order.trackingNumber ? { courier: order.courier || null, number: order.trackingNumber } : null,
      canCancel,
      canRequestRefund,
      refund,
      // The owner moved the order on instead of approving the request.
      cancellationDeclined:
        requestedCancellation && !['CANCELLATION_REQUESTED', 'CANCELLATION_APPROVED', 'CANCELLED'].includes(order.status),
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

  /**
   * Cash on delivery only. An online-payment order is never made here: it's created only once Razorpay
   * confirms the payment (payment.service verifyPayment / the payment.captured webhook), so no order
   * can exist that hasn't been paid for.
   */
  async createFromCart(userId: string, input: CreateOrderInput) {
    if (input.paymentMethod !== 'COD') {
      throw ApiError.badRequest('Online orders are created once your payment goes through. Please check out and pay.');
    }
    if (input.paymentMethod === 'COD' && !COD_ENABLED) {
      throw ApiError.badRequest('Cash on delivery is not available right now. Please pay online.');
    }

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

      if (product.isPaused) {
        throw ApiError.badRequest(`"${product.title}" is currently unavailable. Remove it from your cart to continue.`);
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

    const orderNumber = await checkoutSessionRepository.newOrderNumber();
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
        cancellationAllowed: await settingsService.isCancellationAllowed(),
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

  async requestCancellation(orderId: string, userId: string, reason: string) {
    const order = await orderRepository.findById(orderId);
    // Someone else's order looks the same as one that doesn't exist.
    if (!order || order.userId !== userId) {
      throw ApiError.notFound('Order not found');
    }

    if (order.cancellationAllowed === false) {
      throw ApiError.conflict(NO_CANCELLATION_MESSAGE);
    }
    if (!(await orderRepository.requestCancellation(orderId, userId, reason))) {
      throw ApiError.conflict("This order can't be cancelled any more.");
    }
    return this.formatOrder(await orderRepository.findById(orderId));
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
