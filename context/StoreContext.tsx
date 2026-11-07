'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Product,
  products as initialProducts,
  categories,
} from '@/lib/placeholder-data';

export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancellation Requested'
  | 'Cancellation Approved'
  | 'Cancelled';

export interface StoreOrder {
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
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
}

interface StoreContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => Promise<boolean>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<boolean>;
  getProductById: (id: string) => Product | undefined;
  resetProducts: () => void;

  // Orders & Fulfillment
  orders: StoreOrder[];

  // Categories
  categories: string[];
  categoriesList: Array<{
    id: string;
    name: string;
    slug: string;
    image?: string;
    imageUrl?: string;
    description?: string;
    productCount?: number;
  }>;
  refreshCategories: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;

  isLoaded: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [categoriesList, setCategoriesList] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      image?: string;
      imageUrl?: string;
      description?: string;
      productCount?: number;
    }>
  >([]);
  const [categoriesState, setCategoriesState] = useState<string[]>([...categories]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategoriesList(data.data);
          const names = ['All', ...data.data.map((c: any) => c.name)];
          setCategoriesState(names);
        }
      }
    } catch (e) {
      console.warn('Could not fetch categories from API:', e);
    }
  };

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products?pageSize=100');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.items) && data.data.items.length > 0) {
          setProducts(data.data.items);
        }
      }
    } catch (e) {
      console.warn('Could not refresh products from API:', e);
    }
  };

  // Only the homepage and the admin read this list, so other pages don't download it.
  const pathname = usePathname();
  const needsProductList = pathname === '/' || pathname?.startsWith('/admin');
  useEffect(() => {
    if (needsProductList) void refreshProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsProductList]);

  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      }
    } catch (e) {
      console.warn('Could not refresh orders from API:', e);
    }
  };

  // Load orders (admin only) and categories on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // Only fetch protected admin endpoints if browsing the /admin portal
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          try {
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
              const data = await res.json();
              if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                if (isMounted) setOrders(data.data);
              }
            }
          } catch (e) {
            // ignore admin unauthorized on guest pages
          }
        }

        try {
          await refreshCategories();
        } catch (e) {
          console.warn('Could not load categories:', e);
        }
      } catch (err) {
        console.error('Error loading store data:', err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Product Actions
  const addProduct = async (newProd: Omit<Product, 'id'> & { id?: string }) => {
    const tempId = newProd.id || `prod_${Date.now()}`;
    const fullProd: Product = {
      ...newProd,
      id: tempId,
      rating: newProd.rating ?? 5.0,
      reviewCount: newProd.reviewCount ?? 1,
      itemDetails: newProd.itemDetails?.length ? newProd.itemDetails : ['Temple blessed authentic talisman'],
      maker: newProd.maker || 'Miracle Feng Shui Studio',
    };
    setProducts((prev) => [fullProd, ...prev]);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProd.name,
          description: newProd.description || 'Authentic blessed talisman',
          price: newProd.price,
          comparePrice: newProd.originalPrice,
          originalPrice: newProd.originalPrice,
          discount: newProd.discount ? newProd.discount.trim() : null,
          categoryId: newProd.category,
          images: newProd.images?.length
            ? newProd.images
            : ['https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80'],
          stock: newProd.stock !== undefined ? newProd.stock : 50,
          itemDetails: newProd.itemDetails ?? [],
          isFeatured: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('API add product failed:', res.status, errData);
        // Revert the optimistic local insert so the UI doesn't lie about persistence
        setProducts((prev) => prev.filter((p) => p.id !== tempId));
        return false;
      }

      const data = await res.json();
      if (data.success && data.data?.id) {
        setProducts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: data.data.id } : p))
        );
      }
      await refreshProducts();
      return true;
    } catch (err) {
      console.error('API add product failed, reverted local state:', err);
      setProducts((prev) => prev.filter((p) => p.id !== tempId));
      return false;
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updated.name,
          price: updated.price,
          comparePrice: updated.originalPrice ?? null,
          originalPrice: updated.originalPrice ?? null,
          categoryId: updated.category,
          category: updated.category,
          description: updated.description || 'Authentic blessed talisman',
          images: updated.images,
          stock: updated.stock,
          bestseller: updated.bestseller,
          etsyPick: updated.etsyPick,
          discount: updated.discount ?? null,
          itemDetails: updated.itemDetails,
          materials: updated.materials,
          isActive: updated.isActive,
          isPaused: updated.isPaused,
          maker: updated.maker || undefined,
          freeShipping: updated.freeShipping,
          showStockLeft: updated.showStockLeft,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('API update product failed:', res.status, errData);
        return false;
      }
      // Refresh in the background: local state is already updated optimistically,
      // so don't make the save wait on a full catalog re-fetch.
      refreshProducts().catch((e) => console.warn('Background product refresh failed:', e));
      return true;
    } catch (err) {
      console.error('API update product failed:', err);
      return false;
    }
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const resetProducts = () => {
    setProducts(initialProducts);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        getProductById,
        resetProducts,
        // Orders & Fulfillment
        orders,
        // Categories
        categories: categoriesState,
        categoriesList,
        refreshCategories,
        refreshProducts,
        refreshOrders,
        isLoaded,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
