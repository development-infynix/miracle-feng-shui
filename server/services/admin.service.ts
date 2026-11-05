import { adminRepository } from '../repositories/admin.repository';
import { productRepository } from '../repositories/product.repository';
import { orderRepository } from '../repositories/order.repository';
import {
  AdminProductQueryInput,
  CreateProductInput,
  UpdateProductInput,
  UpdateOrderStatusInput,
  UpdateHomepageSectionInput,
} from '../validators/admin.validator';
import { ApiError } from '../utils/ApiError';
import { OrderStatus } from '@/app/generated/prisma/client';

const CUSTOMER_LIST_PAGE_SIZE = 20;

const customerListRange = (page: number) => ({
  skip: (page - 1) * CUSTOMER_LIST_PAGE_SIZE,
  take: CUSTOMER_LIST_PAGE_SIZE,
});

const customerListPage = <T>(items: T[], total: number, page: number) => ({
  items,
  total,
  page,
  hasMore: page * CUSTOMER_LIST_PAGE_SIZE < total,
});

const UI_ORDER_STATUS = {
  PENDING: 'Pending',
  COD_PENDING: 'Pending',
  PAID: 'Processing',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLATION_REQUESTED: 'Cancellation Requested',
  CANCELLATION_APPROVED: 'Cancellation Approved',
  CANCELLED: 'Cancelled',
} as const;

function uiOrderStatus(status: OrderStatus) {
  return UI_ORDER_STATUS[status];
}

export const adminService = {
  async getDashboard() {
    return adminRepository.getDashboardStats();
  },

  formatAdminProduct(p: any) {
    return {
      id: p.id,
      slug: p.slug,
      name: p.title,
      title: p.title,
      price: p.price,
      comparePrice: p.comparePrice,
      originalPrice: p.comparePrice,
      rating: p.ratingAvg,
      ratingAvg: p.ratingAvg,
      reviewCount: p._count?.reviews ?? 0,
      reviewsCount: p._count?.reviews ?? 0,
      maker: p.maker,
      makerAvatar: p.makerAvatar,
      makerSales: p.makerSales,
      salesCount: p.makerSales,
      starSeller: p.starSeller,
      bestseller: p.bestseller,
      etsyPick: p.etsyPick,
      freeShipping: p.freeShipping,
      discount: p.discount,
      images: p.images,
      description: p.description,
      category: p.category?.name || p.category,
      categoryId: p.categoryId,
      stock: p.stock,
      itemDetails: p.itemDetails,
      materials: p.materials,
      tags: p.tags,
      variations: p.variations,
      allowsPersonalization: p.allowsPersonalization,
      personalizationPrompt: p.personalizationPrompt,
      inDemandCount: p.inDemandCount,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  },

  formatProductCard(p: any) {
    return {
      id: p.id,
      name: p.title,
      title: p.title,
      images: p.images,
      price: p.price,
      originalPrice: p.comparePrice,
      discount: p.discount,
      category: p.category?.name || p.category,
      stock: p.stock,
      isActive: p.isActive,
    };
  },

  async getProducts(query: AdminProductQueryInput) {
    const { items, total, page, totalPages } = await adminRepository.findProducts(query);
    return {
      products: items.map(this.formatProductCard),
      total,
      page,
      pageSize: query.pageSize,
      totalPages,
    };
  },

  async getProductStockStats() {
    return adminRepository.getProductStockStats();
  },

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return this.formatAdminProduct(product);
  },

  async createProduct(input: CreateProductInput) {
    const product = await adminRepository.createProduct(input);
    return this.formatAdminProduct(product);
  },

  async updateProduct(id: string, input: UpdateProductInput) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Product not found');
    }

    const product = await adminRepository.updateProduct(id, input);
    return this.formatAdminProduct(product);
  },

  async deleteProduct(id: string, hardDelete = false) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Product not found');
    }

    if (hardDelete) {
      const orderItemCount = await adminRepository.countOrderItemsForProduct(id);
      if (orderItemCount > 0) {
        throw ApiError.conflict(
          "This product is part of past orders, so it can't be deleted. Mark it inactive in edit mode to hide it from the store."
        );
      }
    }

    await adminRepository.deleteProduct(id, hardDelete);
    return { message: 'Product successfully deleted' };
  },

  async getOrders(filters?: { status?: string; search?: string }) {
    let orderStatus: OrderStatus | undefined;
    if (filters?.status && filters.status !== 'all') {
      orderStatus = filters.status.toUpperCase().replace(/ /g, '_') as OrderStatus;
    }

    const orders = await adminRepository.findAllOrders({
      status: orderStatus,
      search: filters?.search,
    });

    return orders.map((o) => {
      const addr = (o.shippingAddress as any) || {};
      const uiStatus = uiOrderStatus(o.status);

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        date: o.createdAt.toISOString().replace('T', ' ').substring(0, 16),
        customerName: addr.name || o.user?.name || 'Valued Customer',
        email: addr.email || o.user?.email || '',
        phone: addr.phone || o.user?.phone || '',
        address: addr.line1 ? `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}` : '',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pincode || '',
        totalAmount: o.total,
        paymentMethod: o.paymentMethod === 'RAZORPAY' ? 'UPI / Online Payment' : 'Cash on Delivery',
        status: uiStatus,
        rawStatus: o.status,
        paymentStatus: o.paymentStatus,
        cancellationReason: o.cancellationReason,
        refund: o.refunds[0]
          ? {
              id: o.refunds[0].id,
              status: o.refunds[0].status,
              amount: o.refunds[0].amountPaise / 100,
              razorpayRefundId: o.refunds[0].razorpayRefundId,
              failureReason: o.refunds[0].failureReason,
              stockReturned: o.refunds[0].stockReturned,
            }
          : null,
        items: o.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: it.title,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
        })),
      };
    });
  },

  async updateOrderStatus(id: string, input: UpdateOrderStatusInput) {
    const existing = await orderRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Order not found');
    }

    // Money has gone back or is on its way, so the order can't go back to being fulfilled.
    const moneyMoved = existing.refunds?.some((refund) => refund.status === 'PROCESSING' || refund.status === 'PROCESSED');
    if (moneyMoved && input.status !== 'CANCELLATION_APPROVED' && input.status !== 'CANCELLED') {
      throw ApiError.conflict('This order has a refund, so it has to stay cancelled.');
    }

    const updated = await adminRepository.updateOrderStatus(id, input.status as OrderStatus);
    const addr = (updated.shippingAddress as any) || {};
    return {
      id: updated.id,
      orderNumber: updated.orderNumber,
      date: updated.createdAt.toISOString().replace('T', ' ').substring(0, 16),
      customerName: updated.user?.name || addr.name || 'Valued Customer',
      email: updated.user?.email || addr.email || '',
      phone: updated.user?.phone || addr.phone || '',
      address: addr.line1 ? `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}` : '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      totalAmount: updated.total,
      paymentMethod: updated.paymentMethod === 'RAZORPAY' ? 'UPI / Online Payment' : 'Cash on Delivery',
      status: uiOrderStatus(updated.status),
      rawStatus: updated.status,
      paymentStatus: updated.paymentStatus,
      items: updated.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.title,
        price: it.price,
        quantity: it.quantity,
        image: it.image,
      })),
    };
  },

  async getCustomerProfile(id: string) {
    const customer = await adminRepository.findCustomerProfile(id);
    if (!customer) throw ApiError.notFound('Customer not found');
    return customer;
  },

  async getCustomerFavorites(id: string, page: number) {
    const customer = await adminRepository.findCustomerFavorites(id, customerListRange(page));
    if (!customer) throw ApiError.notFound('Customer not found');
    return customerListPage(customer.favorites, customer._count.favorites, page);
  },

  async getCustomerCart(id: string, page: number) {
    const customer = await adminRepository.findCustomerCart(id, customerListRange(page));
    if (!customer) throw ApiError.notFound('Customer not found');

    const totals = await adminRepository.findCustomerCartTotals(id);
    return {
      ...customerListPage(customer.cart?.items ?? [], customer.cart?._count.items ?? 0, page),
      quantity: totals.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: totals.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    };
  },

  async getCustomerOrders(id: string, page: number) {
    const customer = await adminRepository.findCustomerOrders(id, customerListRange(page));
    if (!customer) throw ApiError.notFound('Customer not found');

    return {
      ...customerListPage(customer.orders, customer._count.orders, page),
      totalAmount: await adminRepository.sumCustomerOrders(id),
    };
  },

  async getHomepageSections() {
    const sections = await adminRepository.getHomepageSections();
    return sections.map((sec) => ({
      id: sec.sectionKey as any,
      sectionKey: sec.sectionKey,
      name: sec.name,
      enabled: sec.enabled,
      title: sec.title,
      subtitle: sec.subtitle || undefined,
      ctaText: sec.ctaText || undefined,
      ctaLink: sec.ctaLink || undefined,
      badge: sec.badge || undefined,
      order: sec.order,
    }));
  },

  async updateHomepageSections(input: UpdateHomepageSectionInput) {
    await adminRepository.updateHomepageSections(input.sections);
    return this.getHomepageSections();
  },
};
