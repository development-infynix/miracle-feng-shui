'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Product } from '@/lib/placeholder-data';

export type CartItem = {
  id: string; // unique item id combining product id and variations
  product: Product;
  productId?: string;
  quantity: number;
  selectedVariations?: Record<string, string>;
  personalizationText?: string;
  isGift?: boolean;
};

export interface ToastInfo {
  open: boolean;
  title: string;
  subtitle?: string;
  type?: 'favorite' | 'cart' | 'info';
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    selectedVariations?: Record<string, string>,
    personalizationText?: string
  ) => boolean;
  removeItem: (itemId: string) => void;
  setQty: (itemId: string, quantity: number) => void;
  toggleGift: (itemId: string) => void;
  saveForLater: (itemId: string) => boolean;
  clearCart: () => void;
  count: number;
  subtotal: number;
  savings: number;

  // Favorites / Wishlist
  favorites: Product[];
  addFavorite: (product: Product) => boolean;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Auth & Guest Toast
  userLoggedIn: boolean;
  setUserLoggedIn: (val: boolean) => void;
  guestToast: ToastInfo | null;
  showGuestToast: (title?: string, subtitle?: string, type?: 'favorite' | 'cart' | 'info') => void;
  closeGuestToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'miracle_feng_shui_cart_v1';
const FAV_STORAGE_KEY = 'miracle_feng_shui_favorites_v1';
const USER_STORAGE_KEY = 'miracle_feng_shui_user_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [userLoggedIn, setUserLoggedInState] = useState(false);
  const [guestToast, setGuestToast] = useState<ToastInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync NextAuth session with local user status
  useEffect(() => {
    if (status === 'loading') return; // Don't clear anything during session hydration
    if (status === 'authenticated' && session?.user) {
      setUserLoggedInState(true);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(true));
      } catch (e) {
        console.error(e);
      }
    } else if (status === 'unauthenticated') {
      // Only clear if we were previously logged in (explicit logout)
      const prevAuth = (() => { try { return localStorage.getItem(USER_STORAGE_KEY) === 'true'; } catch { return false; } })();
      if (prevAuth) {
        setUserLoggedInState(false);
        setItems([]);
        setFavorites([]);
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(false));
          localStorage.removeItem(CART_STORAGE_KEY);
          localStorage.removeItem(FAV_STORAGE_KEY);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [status, session]);

  // Load from localStorage on mount ONLY if user was logged in
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      const isUserSaved = savedUser ? JSON.parse(savedUser) : false;
      if (isUserSaved) {
        setUserLoggedInState(true);
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
        const savedFavs = localStorage.getItem(FAV_STORAGE_KEY);
        if (savedFavs) {
          setFavorites(JSON.parse(savedFavs));
        }
      } else {
        setUserLoggedInState(false);
        setItems([]);
        setFavorites([]);
      }
    } catch (e) {
      console.error('Failed to load storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Deduplicate and consolidate cart items helper
  const consolidateItems = (rawItems: CartItem[]): CartItem[] => {
    const map = new Map<string, CartItem>();
    for (const item of rawItems) {
      const prodId = item.product?.id || item.productId || item.id;
      const varKey = item.selectedVariations
        ? Object.entries(item.selectedVariations)
            .map(([k, v]) => `${k}:${v}`)
            .sort()
            .join('|')
        : '';
      const pText = item.personalizationText || '';
      const key = `${prodId}-${varKey}-${pText}`;

      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...existing,
          quantity: existing.quantity + item.quantity,
        });
      } else {
        map.set(key, { ...item });
      }
    }
    return Array.from(map.values());
  };

  // Fetch persisted cart and favorites from DB when authenticated
  useEffect(() => {
    if (status === 'authenticated' || userLoggedIn) {
      fetch('/api/cart')
        .then((res) => (res.ok ? res.json() : null))
        .then((resData) => {
          if (resData?.data?.items && Array.isArray(resData.data.items)) {
            setItems(consolidateItems(resData.data.items));
          }
        })
        .catch(() => {});

      fetch('/api/favorites')
        .then((res) => (res.ok ? res.json() : null))
        .then((resData) => {
          if (resData?.data && Array.isArray(resData.data)) {
            setFavorites(resData.data);
          }
        })
        .catch(() => {});
    }
  }, [status, userLoggedIn]);

  // Save cart to localStorage only when user is logged in
  useEffect(() => {
    if (!isLoaded) return;
    if (!userLoggedIn && status !== 'authenticated') return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [items, isLoaded, userLoggedIn, status]);

  // Save favorites to localStorage only when user is logged in
  useEffect(() => {
    if (!isLoaded) return;
    if (!userLoggedIn && status !== 'authenticated') return;
    try {
      localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }, [favorites, isLoaded, userLoggedIn, status]);

  const setUserLoggedIn = useCallback((val: boolean) => {
    setUserLoggedInState(val);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(val));
      if (!val) {
        setItems([]);
        setFavorites([]);
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(FAV_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save user session:', e);
    }
  }, []);

  const showGuestToast = useCallback((
    title = "Don't lose this favourite!",
    subtitle = "to add to your wishlist.",
    type: 'favorite' | 'cart' | 'info' = 'favorite'
  ) => {
    setGuestToast({
      open: true,
      title,
      subtitle,
      type,
    });
  }, []);

  const closeGuestToast = useCallback(() => {
    setGuestToast(null);
  }, []);

  // Listen to custom show-guest-toast events
  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        title?: string;
        subtitle?: string;
        type?: 'favorite' | 'cart' | 'info';
      }>;
      const detail = customEvent.detail || {};
      showGuestToast(
        detail.title || (detail.type === 'cart' ? "Don't lose this item!" : "Don't lose this favourite!"),
        detail.subtitle || (detail.type === 'cart' ? "to add to your cart." : "to add to your wishlist."),
        detail.type || 'favorite'
      );
    };

    window.addEventListener('show-guest-toast', handleToastEvent);
    return () => {
      window.removeEventListener('show-guest-toast', handleToastEvent);
    };
  }, [showGuestToast]);

  const addItem = useCallback((
    product: Product,
    quantity: number = 1,
    selectedVariations?: Record<string, string>,
    personalizationText?: string
  ): boolean => {
    if (quantity <= 0) return false;

    const isAuthed = status === 'authenticated' || userLoggedIn;
    if (!isAuthed) {
      showGuestToast(
        "Don't lose this item!",
        'to add to your basket.',
        'cart'
      );
      return false;
    }

    // Create unique key based on product + variations
    const varKey = selectedVariations
      ? Object.entries(selectedVariations)
          .map(([k, v]) => `${k}:${v}`)
          .sort()
          .join('|')
      : '';
    const pText = personalizationText || '';
    const fallbackItemId = `${product.id}-${varKey}-${pText}`;

    setItems((prev) => {
      const matchIndex = prev.findIndex((item) => {
        const itemProdId = item.product?.id || item.productId;
        const itemVarKey = item.selectedVariations
          ? Object.entries(item.selectedVariations)
              .map(([k, v]) => `${k}:${v}`)
              .sort()
              .join('|')
          : '';
        const itemPText = item.personalizationText || '';
        return (
          (itemProdId === product.id || item.id === fallbackItemId) &&
          itemVarKey === varKey &&
          itemPText === pText
        );
      });

      if (matchIndex > -1) {
        const updated = [...prev];
        updated[matchIndex] = {
          ...updated[matchIndex],
          quantity: updated[matchIndex].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prev,
        {
          id: fallbackItemId,
          product,
          productId: product.id,
          quantity,
          selectedVariations,
          personalizationText,
          isGift: false,
        },
      ];
    });

    // Persist to backend and update state with consolidated response
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        quantity,
        selectedVariations,
        personalizationText,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.data?.items && Array.isArray(resData.data.items)) {
          setItems(consolidateItems(resData.data.items));
        }
      })
      .catch((err) => {
        console.error('Failed to sync cart item to DB:', err);
      });

    return true;
  }, [status, userLoggedIn, showGuestToast]);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.id !== itemId && item.productId !== itemId && item.product?.id !== itemId
      )
    );

    const isAuthed = status === 'authenticated' || userLoggedIn;
    if (isAuthed) {
      fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((resData) => {
          if (resData?.data?.items && Array.isArray(resData.data.items)) {
            setItems(consolidateItems(resData.data.items));
          }
        })
        .catch((err) => {
          console.error('Failed to delete cart item from DB:', err);
        });
    }
  }, [status, userLoggedIn]);

  const setQty = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId || item.productId === itemId || item.product?.id === itemId
          ? { ...item, quantity }
          : item
      )
    );

    const isAuthed = status === 'authenticated' || userLoggedIn;
    if (isAuthed) {
      fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((resData) => {
          if (resData?.data?.items && Array.isArray(resData.data.items)) {
            setItems(consolidateItems(resData.data.items));
          }
        })
        .catch((err) => {
          console.error('Failed to update cart item in DB:', err);
        });
    }
  }, [removeItem, status, userLoggedIn]);

  const toggleGift = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isGift: !item.isGift } : item
      )
    );
  }, []);

  const addFavorite = useCallback((product: Product): boolean => {
    const isAuthed = status === 'authenticated' || userLoggedIn;
    if (!isAuthed) {
      showGuestToast(
        "Don't lose this favourite!",
        'to add to your wishlist.',
        'favorite'
      );
      return false;
    }

    setFavorites((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [product, ...prev];
    });

    // Persist to backend
    fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    }).catch((err) => {
      console.error('Failed to sync favorite to DB:', err);
    });

    return true;
  }, [status, userLoggedIn, showGuestToast]);

  const removeFavorite = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));

    const isAuthed = status === 'authenticated' || userLoggedIn;
    if (isAuthed) {
      fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      }).catch((err) => {
        console.error('Failed to sync favorite removal to DB:', err);
      });
    }
  }, [status, userLoggedIn]);

  const isFavorite = useCallback((productId: string) => {
    return favorites.some((p) => p.id === productId);
  }, [favorites]);

  const saveForLater = useCallback((itemId: string): boolean => {
    const isAuthed = status === 'authenticated' || userLoggedIn;
    if (!isAuthed) {
      showGuestToast(
        "Don't lose this favourite!",
        'to add to your wishlist.',
        'favorite'
      );
      return false;
    }

    setItems((prev) => {
      const itemToSave = prev.find((it) => it.id === itemId);
      if (itemToSave) {
        setFavorites((favs) => {
          if (favs.some((p) => p.id === itemToSave.product.id)) return favs;
          return [itemToSave.product, ...favs];
        });
        fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: itemToSave.product.id }),
        }).catch(() => {});
      }
      return prev.filter((it) => it.id !== itemId);
    });

    fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    }).catch(() => {});

    return true;
  }, [status, userLoggedIn, showGuestToast]);

  const clearCart = useCallback(() => {
    setItems([]);

    const isAuthed = status === 'authenticated' || userLoggedIn;
    if (isAuthed) {
      fetch('/api/cart', {
        method: 'DELETE',
      }).catch((err) => {
        console.error('Failed to clear cart in DB:', err);
      });
    }
  }, [status, userLoggedIn]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const savings = items.reduce((sum, item) => {
    if (item.product.originalPrice && item.product.originalPrice > item.product.price) {
      return (
        sum +
        (item.product.originalPrice - item.product.price) * item.quantity
      );
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        setQty,
        toggleGift,
        saveForLater,
        clearCart,
        count,
        subtotal,
        savings,
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        userLoggedIn,
        setUserLoggedIn,
        guestToast,
        showGuestToast,
        closeGuestToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
