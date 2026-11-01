"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ENGRAVING_PRICE, getProduct, type Engraving } from "@/data/products";

export type CartItem = { slug: string; variantId: string; qty: number; engraving?: Engraving };

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (slug: string, variantId: string, engraving?: Engraving) => void;
  setQty: (line: CartItem, qty: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "solenne-cart";

/** Two lines are the same product only if their engraving matches too. */
export function lineKey(i: Pick<CartItem, "slug" | "variantId" | "engraving">) {
  return [i.slug, i.variantId, i.engraving?.style ?? "", i.engraving?.text ?? ""].join("|");
}

export function linePrice(i: CartItem) {
  const variant = getProduct(i.slug)?.variants.find((v) => v.id === i.variantId);
  return ((variant?.price ?? 0) + (i.engraving ? ENGRAVING_PRICE : 0)) * i.qty;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once on mount
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = (slug: string, variantId: string, engraving?: Engraving) =>
    setItems((prev) => {
      const key = lineKey({ slug, variantId, engraving });
      const hit = prev.find((i) => lineKey(i) === key);
      if (hit) return prev.map((i) => (i === hit ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { slug, variantId, qty: 1, ...(engraving ? { engraving } : {}) }];
    });

  const setQty = (line: CartItem, qty: number) =>
    setItems((prev) =>
      prev.map((i) => (lineKey(i) === lineKey(line) ? { ...i, qty } : i)).filter((i) => i.qty > 0),
    );

  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((sum, i) => sum + linePrice(i), 0);

  return (
    <CartContext.Provider value={{ items, count, total, add, setQty }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
