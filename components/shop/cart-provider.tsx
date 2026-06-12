"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItemInput = {
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  imageUrl?: string;
  price: number;
  size: string;
  quantity: number;
};

export type CartItem = CartItemInput & {
  lineId: string;
};

type CartContextValue = {
  addItem: (item: CartItemInput) => void;
  clearCart: () => void;
  closeCart: () => void;
  isCartOpen: boolean;
  itemCount: number;
  items: CartItem[];
  openCart: () => void;
  removeItem: (lineId: string) => void;
  subtotal: number;
  updateQuantity: (lineId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "tow-cart";

function makeLineId(productId: string, size: string) {
  return `${productId}::${size}`;
}

function readStoredCart() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setItems(readStoredCart());
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const addItem = useCallback((item: CartItemInput) => {
    const quantity = Math.max(1, Math.round(item.quantity));
    const lineId = makeLineId(item.productId, item.size);

    setItems((current) => {
      const existing = current.find((cartItem) => cartItem.lineId === lineId);
      if (existing) {
        return current.map((cartItem) =>
          cartItem.lineId === lineId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem,
        );
      }

      return [...current, { ...item, quantity, lineId }];
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    const nextQuantity = Math.max(1, Math.round(quantity));
    setItems((current) =>
      current.map((item) =>
        item.lineId === lineId ? { ...item, quantity: nextQuantity } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((current) => current.filter((item) => item.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      addItem,
      clearCart,
      closeCart: () => setIsCartOpen(false),
      isCartOpen,
      itemCount,
      items,
      openCart: () => setIsCartOpen(true),
      removeItem,
      subtotal,
      updateQuantity,
    };
  }, [addItem, clearCart, isCartOpen, items, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }
  return context;
}
