import { adminRepository } from '../repositories/admin.repository';
import { productRepository } from '../repositories/product.repository';
import { orderRepository } from '../repositories/order.repository';
import {
  AdminProductQueryInput,
  CreateProductInput,
  UpdateProductInput,
  UpdateOrderStatusInput,
} from '../validators/admin.validator';
import { ApiError } from '../utils/ApiError';
import { OrderStatus, Prisma } from '@/app/generated/prisma/client';

const CUSTOMER_LIST_PAGE_SIZE = 20;

/** Orders still on their way to the customer, or waiting on a cancellation decision. */
export const IN_PROGRESS_ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'COD_PENDING',
  'PROCESSING',
  'SHIPPED',
  'CANCELLATION_REQUESTED',
];

/**
 * An open order keeps its products from being removed. That's one in progress, or a cancelled one
 * (approved or final) the customer paid for and hasn't had a refund processed for yet.
 * Delivered orders, unpaid cancellations and refunded cancellations are finished.
 */
export const OPEN_ORDER_WHERE: Prisma.OrderWhereInput = {
  OR: [
    { status: { in: IN_PROGRESS_ORDER_STATUSES } },
    {
      status: { in: ['CANCELLATION_APPROVED', 'CANCELLED'] },
      paymentStatus: 'PAID',
      refunds: { none: { status: 'PROCESSED' } },
    },
  ],
};

/**
 * What removing a product does:
 * - blocked: it's in an open order, so it stays until that order is delivered or cancelled;
 * - archive: it's only in finished orders, so it's hidden from the store but kept for their history and invoices;
 * - in_stock: it's in no order but still has stock, so it has to be sold out (stock 0) before it can be deleted;
 * - delete: it's in no order and sold out, so it's removed for good (with it, any cart lines and favorites).
 */
export type ProductRemoval = { mode: 'blocked' | 'archive' | 'in_stock' | 'delete'; openOrders: number };

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

const DAY_MS = 24 * 60 * 60 * 1000;
const DASHBOARD_PERIOD_DAYS = 30;
/** Below this many in stock, a product counts as low on stock (matches the admin product list). */
const LOW_STOCK = 10;

export type DashboardTopProduct = { productId: string; title: string; image: string; units: number; revenue: number };

export type DashboardData = {
  periodDays: number;
  totalOrders: number;
  action: {
    toConfirm: number;
    toPack: number;
    inTransit: number;
    cancellationRequests: number;
    refundsDue: number;
    refundsFailed: number;
  };
  sales: {
    revenue: number;
    previousRevenue: number;
    revenueChange: number | null;
    orders: number;
    previousOrders: number;
    averageOrder: number;
    codDue: number;
    codDueOrders: number;
  };
  topProducts: DashboardTopProduct[];
  catalog: {
    activeProducts: number;
    pausedProducts: number;
    inactiveProducts: number;
    outOfStock: number;
    lowStock: number;
    lowStockThreshold: number;
    alerts: { id: string; title: string; stock: number; image: string; isPaused: boolean }[];
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: (typeof UI_ORDER_STATUS)[OrderStatus];
    paymentMethod: 'COD' | 'Online';
    items: number;
    createdAt: string;
  }[];
};

/**
 * The orders page filters by the status customers and admins see. Each covers these stored statuses:
 * an online order arrives paid (PAID, shown as Processing) and a COD order arrives as COD_PENDING (shown as Pending).
 */
export const ORDER_STATUSES_FOR_FILTER: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ['PENDING', 'COD_PENDING'],
  PROCESSING: ['PAID', 'PROCESSING'],
};

export const adminService = {
  /**
   * What the owner needs from the dashboard: what needs action now, how sales are going,
   * what is selling, and whether the catalog is ready. Sales compare the last 30 days with the 30 before.
   */
  async getDashboard(now = new Date()): Promise<DashboardData> {
    const since = new Date(now.getTime() - DASHBOARD_PERIOD_DAYS * DAY_MS);
    const previousSince = new Date(since.getTime() - DASHBOARD_PERIOD_DAYS * DAY_MS);
    const raw = await adminRepository.getDashboardData(since, previousSince, LOW_STOCK);

    const countOf = (...statuses: OrderStatus[]) =>
      raw.statusCounts.filter((row) => statuses.includes(row.status)).reduce((sum, row) => sum + row.count, 0);

    const current = raw.periodOrders.filter((o) => o.createdAt >= since);
    const previous = raw.periodOrders.filter((o) => o.createdAt < since);
    const revenue = current.reduce((sum, o) => sum + o.total, 0);
    const previousRevenue = previous.reduce((sum, o) => sum + o.total, 0);

    const byProduct = new Map<string, DashboardTopProduct>();
    for (const item of raw.soldItems) {
      const row = byProduct.get(item.productId) ?? { productId: item.productId, title: item.title, image: item.image, units: 0, revenue: 0 };
      row.units += item.quantity;
      row.revenue += item.price * item.quantity;
      byProduct.set(item.productId, row);
    }
    const topProducts = [...byProduct.values()]
      .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
      .slice(0, 5);

    return {
      periodDays: DASHBOARD_PERIOD_DAYS,
      totalOrders: raw.statusCounts.reduce((sum, row) => sum + row.count, 0),
      action: {
        toConfirm: countOf('PENDING', 'COD_PENDING'),
        toPack: countOf('PAID', 'PROCESSING'),
        inTransit: countOf('SHIPPED'),
        cancellationRequests: countOf('CANCELLATION_REQUESTED'),
        refundsDue: raw.refundsDue,
        refundsFailed: raw.refundsFailed,
      },
      sales: {
        revenue,
        previousRevenue,
        // No sales in the previous period means there's nothing to compare against.
        revenueChange: previousRevenue > 0 ? (revenue - previousRevenue) / previousRevenue : null,
        orders: current.length,
        previousOrders: previous.length,
        averageOrder: current.length > 0 ? revenue / current.length : 0,
        codDue: raw.codDue.amount,
        codDueOrders: raw.codDue.orders,
      },
      topProducts,
      catalog: {
        ...raw.catalog,
        lowStockThreshold: LOW_STOCK,
        alerts: raw.stockAlerts.map((p) => ({
          id: p.id,
          title: p.title,
          stock: p.stock,
          image: p.images[0] ?? '',
          isPaused: p.isPaused,
        })),
      },
      recentOrders: raw.recentOrders.map((o) => {
        const addr = (o.shippingAddress as { name?: string } | null) ?? {};
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: addr.name || o.user?.name || 'Customer',
          total: o.total,
          status: uiOrderStatus(o.status),
          paymentMethod: o.paymentMethod === 'COD' ? 'COD' : 'Online',
          items: o._count.items,
          createdAt: o.createdAt.toISOString(),
        };
      }),
    };
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
      isPaused: p.isPaused,
      isFeatured: p.isFeatured,
      showStockLeft: p.showStockLeft,
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
      isPaused: p.isPaused,
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
    return { ...this.formatAdminProduct(product), removal: await this.getProductRemoval(id, product.stock) };
  },

  async getProductRemoval(id: string, stock: number): Promise<ProductRemoval> {
    const { openOrders, orderItems } = await adminRepository.countProductOrders(id, OPEN_ORDER_WHERE);
    if (openOrders > 0) return { mode: 'blocked', openOrders };
    if (orderItems > 0) return { mode: 'archive', openOrders: 0 };
    return { mode: stock > 0 ? 'in_stock' : 'delete', openOrders: 0 };
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

  /** Removes a product the only way its orders allow. See ProductRemoval. */
  async deleteProduct(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Product not found');
    }

    const removal = await this.getProductRemoval(id, existing.stock);
    if (removal.mode === 'blocked') {
      const orders = removal.openOrders === 1 ? '1 open order' : `${removal.openOrders} open orders`;
      throw ApiError.conflict(
        `This product is in ${orders}. It can be removed once they're delivered, or cancelled with any refund processed.`
      );
    }

    if (removal.mode === 'in_stock') {
      throw ApiError.conflict(
        `This product still has ${existing.stock} in stock. Set its stock to 0 (sold out) before deleting it.`
      );
    }

    if (removal.mode === 'archive') {
      await adminRepository.deleteProduct(id, false);
      return {
        result: 'archived' as const,
        message: "Archived: it's in past orders, so it's hidden from the store and kept in their history.",
      };
    }

    await adminRepository.deleteProduct(id, true);
    return { result: 'deleted' as const, message: 'Product deleted.' };
  },

  async getOrders(filters?: { status?: string; search?: string }) {
    let statuses: OrderStatus[] | undefined;
    if (filters?.status && filters.status !== 'all') {
      const status = filters.status.toUpperCase().replace(/ /g, '_') as OrderStatus;
      statuses = ORDER_STATUSES_FOR_FILTER[status] ?? [status];
    }

    const orders = await adminRepository.findAllOrders({
      statuses,
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

    // Delivered keeps its first date, so re-saving doesn't move it; any other status clears it.
    const deliveredAt = input.status === 'DELIVERED' ? (existing.deliveredAt ?? new Date()) : null;
    const updated = await adminRepository.updateOrderStatus(id, input.status as OrderStatus, deliveredAt);
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

  /**
   * Deactivating stops the customer signing in and ends their open sessions on their next request.
   * Their orders, addresses and history stay, and orders already placed still go out.
   */
  async setCustomerActive(id: string, active: boolean) {
    const customer = await adminRepository.setCustomerDeactivatedAt(id, active ? null : new Date());
    if (!customer) throw ApiError.notFound('Customer not found');
    return customer;
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
};
