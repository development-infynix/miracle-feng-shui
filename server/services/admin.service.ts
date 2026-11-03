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
      reviewCount: p.ratingCount,
      reviewsCount: p.ratingCount,
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
    const { items, total } = await adminRepository.findProducts(query);
    return {
      products: items.map(this.formatProductCard),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    };
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

    await adminRepository.deleteProduct(id, hardDelete);
    return { message: 'Product successfully deleted' };
  },

  async getOrders(filters?: { status?: string; search?: string }) {
    let orderStatus: OrderStatus | undefined;
    if (filters?.status && filters.status !== 'all') {
      orderStatus = filters.status.toUpperCase() as OrderStatus;
    }

    const orders = await adminRepository.findAllOrders({
      status: orderStatus,
      search: filters?.search,
    });

    return orders.map((o) => {
      const addr = (o.shippingAddress as any) || {};
      const rawStatus = (o.status || '').toUpperCase();
      let uiStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' = 'Pending';
      if (rawStatus === 'COD_PENDING' || rawStatus === 'PENDING') {
        uiStatus = 'Pending';
      } else if (rawStatus === 'PAID' || rawStatus === 'PROCESSING') {
        uiStatus = 'Processing';
      } else if (rawStatus === 'SHIPPED') {
        uiStatus = 'Shipped';
      } else if (rawStatus === 'DELIVERED') {
        uiStatus = 'Delivered';
      } else if (rawStatus === 'CANCELLED') {
        uiStatus = 'Cancelled';
      }

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
      status: (updated.status.charAt(0) + updated.status.slice(1).toLowerCase()) as
        | 'Pending'
        | 'Processing'
        | 'Shipped'
        | 'Delivered'
        | 'Cancelled',
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
