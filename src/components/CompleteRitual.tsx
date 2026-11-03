"use client";

import Image from "next/image";
import Link from "@/i18n/Link";
import { useI18n } from "@/i18n/client";
import { useState } from "react";
import { productPhotos } from "@/data/photos";
import { useCart } from "@/lib/cart";
import { completeRitual } from "@/lib/ritual";

/** In the bag: one suggestion per routine step that's missing, each one tap to add. */
export default function CompleteRitual() {
  const { items, add } = useCart();
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const i18n = useI18n();
  const { t } = i18n;
  const picks = i18n.products(completeRitual(items.map((line) => line.slug)));
  if (picks.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="ritual-title">
      <div className="flex items-end justify-between gap-4">
        <h2 id="ritual-title" className="display text-[clamp(1.8rem,3vw,2.4rem)]">
          {t.cart.completeTitle}
        </h2>
        <Link href="/routine" className="shrink-0 text-sm underline decoration-apricot underline-offset-[6px] hover:text-ember">
          {t.cart.finder}
        </Link>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {picks.map((p) => {
          const photo = productPhotos[p.slug][0];
          const v = p.variants[0];
          return (
            <li key={p.slug} className="flex flex-col rounded-[10px] border border-mist p-3">
              <Link href={`/shop/${p.slug}`} className="group">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[8px] bg-blush-3">
                  <Image src={photo.src} alt={i18n.alt(photo)} fill sizes="(min-width: 640px) 220px, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </span>
                <span className="mt-3 block text-xs text-smoke">{t.catalog.categories[p.category]}</span>
                <span className="block text-[15px] text-ink group-hover:text-ember">{p.name}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  add(p.slug, v.id);
                  setJustAdded(p.slug);
                }}
                className="mt-3 rounded-full border border-ink/20 px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
              >
                {justAdded === p.slug ? t.common.added : i18n.fmt(t.cart.addPrice, { price: i18n.price(v.price) })}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
