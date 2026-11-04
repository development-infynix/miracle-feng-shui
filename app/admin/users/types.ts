// Shared shapes for the admin users feature.
// Serialized by the server page and consumed by the client components.

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

// Minimal product snapshot shown inside favorites / cart tabs.
export interface ProductSummary {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
}

export interface FavoriteRow {
  id: string;
  createdAt: Date;
  product: ProductSummary;
}

export interface CartItemRow {
  id: string;
  quantity: number;
  product: ProductSummary | null;
}

export interface CartRow {
  id: string;
  items: CartItemRow[];
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
  createdAt: Date;
  items: OrderItemRow[];
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  addresses: AddressRow[];
  favorites: FavoriteRow[];
  cart: CartRow | null;
  orders: OrderRow[];
  _count: { orders: number; favorites: number };
}
