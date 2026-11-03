"use client";

import Image from "next/image";
import Link from "@/i18n/Link";
import { productPhotos } from "@/data/photos";
import type { Product } from "@/data/products";
import { useRecent } from "@/lib/recent";
import { useI18n } from "@/i18n/client";

/** A quiet strip of what this visitor looked at last. Hidden until there's something to show. */
export default function RecentlyViewed({ exclude }: { exclude?: string }) {
  const i = useI18n();
  const recent = useRecent()
    .filter((s) => s !== exclude)
    .map((s) => i.bySlug(s))
    .filter((p): p is Product => !!p)
    .slice(0, 5);
  if (recent.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-10" aria-labelledby="recent-title">
      <h2 id="recent-title" className="text-sm text-smoke">
        {i.t.shop.recent}
      </h2>
      <ul className="mt-5 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {recent.map((p) => {
          const photo = productPhotos[p.slug][0];
          return (
            <li key={p.slug} className="w-[min(72vw,260px)] shrink-0 snap-start">
              <Link
                href={`/shop/${p.slug}`}
                className="group flex items-center gap-4 rounded-[10px] border border-mist p-2.5 pe-4 transition-colors hover:border-apricot"
              >
                <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-[8px] bg-blush-3">
                  <Image src={photo.src} alt="" fill sizes="56px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] text-ink">{p.name}</span>
                  <span className="block text-xs text-smoke">{i.fmt(i.t.common.from, { price: i.price(p.variants[0].price) })}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
