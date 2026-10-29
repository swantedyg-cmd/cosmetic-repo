"use client";

import { useEffect, useState } from "react";
import { type Product } from "@/data/products";
import { useCart } from "@/lib/cart";

/** Variant picker and quick add under a product card, so shoppers can buy without opening the page. */
export default function CardActions({ product: p }: { product: Product }) {
  const { add } = useCart();
  const [variant, setVariant] = useState(p.variants[0].id);
  const [added, setAdded] = useState(false);
  const shades = p.variants.every((v) => v.color);

  useEffect(() => {
    if (!added) return;
    const id = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(id);
  }, [added]);

  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-mist pt-4">
      <div className="flex min-w-0 items-center gap-1.5" role="group" aria-label={p.variantLabel}>
        {p.variants.length === 1 ? (
          <span className="text-xs text-smoke">{p.variants[0].label}</span>
        ) : shades ? (
          p.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-label={`${p.variantLabel}: ${v.label}`}
              aria-pressed={variant === v.id}
              onClick={() => setVariant(v.id)}
              className={`h-5 w-5 rounded-full ring-offset-2 ring-offset-canvas transition-shadow ${
                variant === v.id ? "ring-1 ring-ink" : "hover:ring-1 hover:ring-ink/30"
              }`}
              style={{ background: v.color }}
            />
          ))
        ) : (
          p.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={variant === v.id}
              onClick={() => setVariant(v.id)}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                variant === v.id ? "bg-ink text-canvas" : "text-smoke hover:text-ink"
              }`}
            >
              {v.label}
            </button>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          add(p.slug, variant);
          setAdded(true);
        }}
        className={`quick-add relative inline-flex h-9 min-w-[7.5rem] shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm transition-colors duration-300 ${
          added ? "bg-ink text-canvas" : "bg-ember text-canvas hover:bg-tangerine"
        }`}
      >
        {added ? (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path className="quick-add-check" d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Added
          </>
        ) : (
          "Add to bag"
        )}
        <span className="sr-only" aria-live="polite">{added ? `${p.name} added to bag` : ""}</span>
      </button>
    </div>
  );
}
