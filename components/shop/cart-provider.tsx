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

export type CartAvailability = {
  _id: string;
  name: string;
  salePrice: number;
  sizes: string[];
};

export type CartReconciliation = {
  repriced: string[];
  removed: string[];
};

function sizeStillOffered(item: CartItem, product: CartAvailability) {
  return product.sizes.some(
    (size) => size.trim().toLowerCase() === item.size.trim().toLowerCase(),
  );
}

/**
 * Uporedjuje snimljenu korpu sa aktuelnim stanjem proizvoda. Cista funkcija —
 * koristi je i provider (za izmenu) i potrosac (za poruku korisniku).
 */
export function diffCartAgainst(
  items: CartItem[],
  available: CartAvailability[],
): CartReconciliation {
  const byId = new Map(available.map((product) => [product._id, product]));
  const repriced: string[] = [];
  const removed: string[] = [];

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product || !sizeStillOffered(item, product)) {
      removed.push(product ? `${item.name} (${item.size})` : item.name);
      continue;
    }
    if (product.salePrice !== item.price) {
      repriced.push(item.name);
    }
  }

  return { repriced, removed };
}

type CartContextValue = {
  addItem: (item: CartItemInput) => void;
  clearCart: () => void;
  closeCart: () => void;
  isCartOpen: boolean;
  itemCount: number;
  items: CartItem[];
  openCart: () => void;
  reconcile: (available: CartAvailability[]) => void;
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
    return Array.isArray(parsed)
      ? parsed.filter((item) => !item.productId.startsWith("demo-"))
      : [];
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

  // Usklađuje snimljene cene i veličine sa aktuelnim stanjem iz baze.
  // Stabilna referenca (prazne zavisnosti) da pozivalac može da je drži u dep nizu.
  const reconcile = useCallback((available: CartAvailability[]) => {
    const byId = new Map(available.map((product) => [product._id, product]));

    setItems((current) => {
      const { repriced, removed } = diffCartAgainst(current, available);
      if (repriced.length === 0 && removed.length === 0) {
        return current;
      }

      return current.flatMap((item) => {
        const product = byId.get(item.productId);
        if (!product || !sizeStillOffered(item, product)) return [];
        return product.salePrice === item.price
          ? [item]
          : [{ ...item, price: product.salePrice }];
      });
    });
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
      reconcile,
      removeItem,
      subtotal,
      updateQuantity,
    };
  }, [
    addItem,
    clearCart,
    isCartOpen,
    items,
    reconcile,
    removeItem,
    updateQuantity,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }
  return context;
}
