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
  items: OrderItem[];
}

export interface OrderStats {
  total: number;
  totalRevenue: number;
  settledBalance: number;
  pendingBalance: number;
  byStatus: Record<OrderUiStatus, number>;
}
