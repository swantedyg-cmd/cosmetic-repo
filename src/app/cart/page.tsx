"use client";

import Link from "next/link";
import BottleSilhouette from "@/components/BottleSilhouette";
import { formatPrice, getProduct } from "@/data/products";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { items, total, setQty } = useCart();

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-12">
      <h1 className="display text-[clamp(2rem,4vw,3rem)] ">Your bag</h1>

      {items.length === 0 ? (
        <div className="mt-10">
          <p className="text-smoke">Your bag is empty.</p>
          <Link href="/shop" className="mt-6 inline-block btn">
            Browse formulas
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-mist border-y border-mist">
            {items.map((i) => {
              const p = getProduct(i.slug);
              const v = p?.variants.find((x) => x.id === i.variantId);
              if (!p || !v) return null;
              return (
                <li key={`${i.slug}-${i.variantId}`} className="flex items-center gap-5 py-5">
                  <div className="flex h-20 w-16 shrink-0 items-end justify-center rounded-[10px] bg-[#f6f6f6] p-2">
                    <BottleSilhouette shape={p.shape} color={v.color ?? p.color} />
                  </div>
                  <div className="flex-1">
                    <Link href={`/shop/${p.slug}`} className="font-medium hover:text-ember">{p.name}</Link>
                    <p className="label mt-1 text-smoke">{v.label}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Remove one ${p.name}`}
                      onClick={() => setQty(i.slug, i.variantId, i.qty - 1)}
                      className="h-8 w-8 rounded-full border border-ink/20 hover:border-ink"
                    >
                      −
                    </button>
                    <span className="label w-4 text-center">{i.qty}</span>
                    <button
                      type="button"
                      aria-label={`Add one ${p.name}`}
                      onClick={() => setQty(i.slug, i.variantId, i.qty + 1)}
                      className="h-8 w-8 rounded-full border border-ink/20 hover:border-ink"
                    >
                      +
                    </button>
                  </div>
                  <span className="label w-14 text-right">{formatPrice(v.price * i.qty)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex items-center justify-between">
            <span className="text-smoke">Subtotal</span>
            <span className="font-display text-2xl">{formatPrice(total)}</span>
          </div>
          {/* Placeholder: connect to Shopify / Stripe checkout once the client confirms how they sell. */}
          <button type="button" className="mt-6 w-full btn">
            Checkout
          </button>
          <p className="label mt-3 text-center text-smoke">Shipping calculated at checkout</p>
        </>
      )}
    </div>
  );
}
