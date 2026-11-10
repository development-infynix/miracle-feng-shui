export type OrderUiStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancellation Requested'
  | 'Cancellation Approved'
  | 'Cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderRefund {
  id: string;
  status: 'REQUESTED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  amount: number;
  razorpayRefundId: string | null;
  failureReason: string | null;
  stockReturned: boolean;
}

export interface OrderItemData {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalAmount: number;
  paymentMethod: string;
  status: OrderUiStatus;
  rawStatus: string;
  /** False when the order was placed while the store didn't allow cancellation. */
  cancellationAllowed?: boolean;
  paymentStatus: string;
  cancellationReason?: string | null;
  refund?: OrderRefund | null;
  /** When the order was archived (ISO), or null. Archived orders live on the Archive page. */
  archivedAt?: string | null;
  items: OrderItem[];
}

const IN_PROGRESS = ['PENDING', 'PAID', 'COD_PENDING', 'PROCESSING', 'SHIPPED', 'CANCELLATION_REQUESTED'];

/**
 * Still open, so it can't be archived: in progress, or cancelled and paid with no refund processed yet.
 * Mirrors OPEN_ORDER_WHERE on the server, which has the final say.
 */
export function isOrderOpen(order: Pick<OrderItemData, 'rawStatus' | 'paymentStatus' | 'refund'>) {
  if (IN_PROGRESS.includes(order.rawStatus)) return true;
  const cancelled = order.rawStatus === 'CANCELLATION_APPROVED' || order.rawStatus === 'CANCELLED';
  return cancelled && order.paymentStatus === 'PAID' && order.refund?.status !== 'PROCESSED';
}

export interface OrderStats {
  total: number;
  totalRevenue: number;
  settledBalance: number;
  pendingBalance: number;
  byStatus: Record<OrderUiStatus, number>;
}
