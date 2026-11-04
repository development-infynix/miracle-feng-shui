// Shared shapes for the admin users feature.
// UserRow comes from the server page. The rest come from /api/admin/users/[id],
// so their dates arrive as JSON strings.

export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  _count: { orders: number };
}

export interface AddressRow {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  addresses: AddressRow[];
  _count: { orders: number; favorites: number };
}

// Minimal product snapshot shown inside favorites / cart tabs.
export interface ProductSummary {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export interface FavoriteRow {
  id: string;
  createdAt: string;
  product: ProductSummary;
}

export interface CartItemRow {
  id: string;
  quantity: number;
  product: ProductSummary;
}

// One load-more batch. `total`, `quantity`, `subtotal` and `totalAmount` always
// cover the whole list, including items not loaded yet.
export interface PagedList<T> {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface CartPage extends PagedList<CartItemRow> {
  quantity: number;
  subtotal: number;
}

export interface OrderItemRow {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  items: OrderItemRow[];
}

export interface OrdersPage extends PagedList<OrderRow> {
  totalAmount: number;
}
