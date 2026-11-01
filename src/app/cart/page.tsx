"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import CompleteRitual from "@/components/CompleteRitual";
import { productPhotos } from "@/data/photos";
import { ENGRAVING_PRICE, formatPrice, getProduct } from "@/data/products";
import { lineKey, linePrice, useCart } from "@/lib/cart";

type Status = { kind: "idle" } | { kind: "busy" } | { kind: "demo" } | { kind: "error"; message: string };

export default function CartPage() {
  const { items, total, setQty } = useCart();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function checkout() {
    setStatus({ kind: "busy" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.mode === "live" && typeof data.url === "string") {
        window.location.assign(data.url);
        return;
      }
      if (data.mode === "demo") setStatus({ kind: "demo" });
      else setStatus({ kind: "error", message: data.error ?? "Checkout couldn't be started." });
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the shop. Check your connection and try again." });
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-12">
      <h1 className="display text-[clamp(2rem,4vw,3rem)]">Your bag</h1>

      {items.length === 0 ? (
        <div className="mt-10">
          <p className="text-smoke">Your bag is empty.</p>
          <Link href="/shop" className="btn mt-6 inline-block">
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
                <li key={lineKey(i)} className="flex flex-wrap items-center gap-x-5 gap-y-3 py-5 sm:flex-nowrap">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[10px] bg-blush-3">
                    <Image src={productPhotos[p.slug][0].src} alt={productPhotos[p.slug][0].alt} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/shop/${p.slug}`} className="font-medium text-ink hover:text-ember">
                      {p.name}
                    </Link>
                    <p className="label mt-1 text-smoke">{v.label}</p>
                    {i.engraving && (
                      <p className="mt-1 text-sm">
                        <span className="font-medium text-ink">“{i.engraving.text}”</span>
                        <span className="text-smoke">
                          {" "}
                          · {i.engraving.style === "foil" ? "gold foil" : "etched"} +{formatPrice(ENGRAVING_PRICE)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Remove one ${p.name}`}
                      onClick={() => setQty(i, i.qty - 1)}
                      className="h-11 w-11 rounded-full border border-ink/20 hover:border-ink"
                    >
                      −
                    </button>
                    <span className="label w-4 text-center" aria-label={`Quantity ${i.qty}`}>
                      {i.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add one ${p.name}`}
                      onClick={() => setQty(i, i.qty + 1)}
                      className="h-11 w-11 rounded-full border border-ink/20 hover:border-ink"
                    >
                      +
                    </button>
                  </div>
                  <span className="label w-14 text-right">{formatPrice(linePrice(i))}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex items-center justify-between">
            <span className="text-smoke">Subtotal</span>
            <span className="font-display text-2xl">{formatPrice(total)}</span>
          </div>
          <button type="button" onClick={checkout} disabled={status.kind === "busy"} className="btn mt-6 w-full disabled:opacity-60">
            {status.kind === "busy" ? "Opening secure checkout…" : "Checkout"}
          </button>
          <div aria-live="polite">
            {status.kind === "demo" && (
              <p className="mt-4 rounded-[10px] border border-apricot px-5 py-4 text-sm">
                This is a preview, so checkout isn’t connected yet. Once the shop is linked, this button opens a secure
                Shopify checkout with your bag, engraving included.
              </p>
            )}
            {status.kind === "error" && (
              <p className="mt-4 rounded-[10px] border border-ember px-5 py-4 text-sm text-ember">{status.message}</p>
            )}
          </div>
          <p className="label mt-3 text-center text-smoke">Shipping calculated at checkout</p>

          <CompleteRitual />
        </>
      )}
    </div>
  );
}
