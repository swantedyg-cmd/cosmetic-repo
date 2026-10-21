"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getProduct } from "@/data/products";

export type CartItem = { slug: string; variantId: string; qty: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (slug: string, variantId: string) => void;
  setQty: (slug: string, variantId: string, qty: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "solenne-cart";

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

  const add = (slug: string, variantId: string) =>
    setItems((prev) => {
      const hit = prev.find((i) => i.slug === slug && i.variantId === variantId);
      if (hit) return prev.map((i) => (i === hit ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { slug, variantId, qty: 1 }];
    });

  const setQty = (slug: string, variantId: string, qty: number) =>
    setItems((prev) =>
      prev
        .map((i) => (i.slug === slug && i.variantId === variantId ? { ...i, qty } : i))
        .filter((i) => i.qty > 0),
    );

  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((sum, i) => {
    const variant = getProduct(i.slug)?.variants.find((v) => v.id === i.variantId);
    return sum + (variant?.price ?? 0) * i.qty;
  }, 0);

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
