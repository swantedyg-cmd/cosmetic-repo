"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "@/i18n/Link";
import CompleteRitual from "@/components/CompleteRitual";
import { productPhotos } from "@/data/photos";
import { ENGRAVING_PRICE } from "@/data/products";
import { lineKey, linePrice, useCart } from "@/lib/cart";
import { useI18n } from "@/i18n/client";

type Status = { kind: "idle" } | { kind: "busy" } | { kind: "demo" } | { kind: "error"; message: string };

export default function CartPage() {
  const i = useI18n();
  const { t } = i;
  const { items, total, setQty } = useCart();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function checkout() {
    setStatus({ kind: "busy" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, locale: i.locale }),
      });
      const data = await res.json();
      if (data.mode === "live" && typeof data.url === "string") {
        window.location.assign(data.url);
        return;
      }
      if (data.mode === "demo") setStatus({ kind: "demo" });
      else setStatus({ kind: "error", message: t.cart.error });
    } catch {
      setStatus({ kind: "error", message: t.cart.offline });
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-12">
      <h1 className="display text-[clamp(2rem,4vw,3rem)]">{t.cart.title}</h1>

      {items.length === 0 ? (
        <div className="mt-10">
          <p className="text-smoke">{t.cart.empty}</p>
          <Link href="/shop" className="btn mt-6 inline-block">
            {t.cart.browse}
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-mist border-y border-mist">
            {items.map((line) => {
              const p = i.bySlug(line.slug);
              const v = p?.variants.find((x) => x.id === line.variantId);
              if (!p || !v) return null;
              const photo = productPhotos[p.slug][0];
              return (
                <li key={lineKey(line)} className="flex flex-wrap items-center gap-x-5 gap-y-3 py-5 sm:flex-nowrap">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[10px] bg-blush-3">
                    <Image src={photo.src} alt={i.alt(photo)} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/shop/${p.slug}`} className="font-medium text-ink hover:text-ember">
                      {p.name}
                    </Link>
                    <p className="label mt-1 text-smoke">{v.label}</p>
                    {line.engraving && (
                      <p className="mt-1 text-sm">
                        <span className="font-medium text-ink">“{line.engraving.text}”</span>
                        <span className="text-smoke">
                          {" "}
                          · {line.engraving.style === "foil" ? t.cart.foil : t.cart.etched} +{i.price(ENGRAVING_PRICE)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={i.fmt(t.cart.removeOne, { name: p.name })}
                      onClick={() => setQty(line, line.qty - 1)}
                      className="h-11 w-11 rounded-full border border-ink/20 hover:border-ink"
                    >
                      −
                    </button>
                    <span className="label w-4 text-center" aria-label={i.fmt(t.cart.quantity, { n: line.qty })}>
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={i.fmt(t.cart.addOne, { name: p.name })}
                      onClick={() => setQty(line, line.qty + 1)}
                      className="h-11 w-11 rounded-full border border-ink/20 hover:border-ink"
                    >
                      +
                    </button>
                  </div>
                  <span className="label w-16 text-end tabular-nums">{i.price(linePrice(line))}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex items-center justify-between">
            <span className="text-smoke">{t.cart.subtotal}</span>
            <span className="font-display text-2xl tabular-nums">{i.price(total)}</span>
          </div>
          <button type="button" onClick={checkout} disabled={status.kind === "busy"} className="btn mt-6 w-full disabled:opacity-60">
            {status.kind === "busy" ? t.cart.opening : t.cart.checkout}
          </button>
          <div aria-live="polite">
            {status.kind === "demo" && <p className="mt-4 rounded-[10px] border border-apricot px-5 py-4 text-sm">{t.cart.demo}</p>}
            {status.kind === "error" && (
              <p className="mt-4 rounded-[10px] border border-ember px-5 py-4 text-sm text-ember">{status.message}</p>
            )}
          </div>
          <p className="label mt-3 text-center text-smoke">{t.cart.shipping}</p>

          <CompleteRitual />
        </>
      )}
    </div>
  );
}
