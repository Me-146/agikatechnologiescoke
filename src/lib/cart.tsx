import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchProductsByIds, type StoreProduct } from "./store";

export type CartLine = { id: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  items: Array<{ product: StoreProduct; qty: number }>;
  count: number;
  subtotal: number;
  loading: boolean;
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "agika.cart.v2";
const WISH_KEY = "agika.wishlist.v2";

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [catalogue, setCatalogue] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLines(readStore<CartLine[]>(CART_KEY, []));
    setWishlist(readStore<string[]>(WISH_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const idKey = lines.map((l) => l.id).sort().join(",");

  useEffect(() => {
    if (!hydrated) return;
    const ids = idKey ? idKey.split(",") : [];
    if (ids.length === 0) {
      setCatalogue([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchProductsByIds(ids)
      .then((rows) => {
        if (!cancelled) setCatalogue(rows);
      })
      .catch(() => {
        if (!cancelled) setCatalogue([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [idKey, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const items = lines
      .map((line) => {
        const product = catalogue.find((p) => p.id === line.id);
        return product ? { product, qty: line.qty } : null;
      })
      .filter((x): x is { product: StoreProduct; qty: number } => x !== null);

    return {
      lines,
      items,
      loading,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: items.reduce((sum, i) => sum + i.qty * i.product.price, 0),
      add: (id, qty = 1) =>
        setLines((prev) => {
          const existing = prev.find((l) => l.id === id);
          if (existing) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
          return [...prev, { id, qty }];
        }),
      remove: (id) => setLines((prev) => prev.filter((l) => l.id !== id)),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
        ),
      clear: () => setLines([]),
      wishlist,
      toggleWishlist: (id) =>
        setWishlist((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])),
      isWishlisted: (id) => wishlist.includes(id),
    };
  }, [lines, wishlist, catalogue, loading]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
