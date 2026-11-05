export type OrderUiStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
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
  paymentStatus: string;
  items: OrderItem[];
}

export interface OrderStats {
  total: number;
  totalRevenue: number;
  settledBalance: number;
  pendingBalance: number;
  byStatus: Record<OrderUiStatus, number>;
}
