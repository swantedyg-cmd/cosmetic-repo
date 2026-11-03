"use client";

import Link from "@/i18n/Link";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import Reviews from "./Reviews";
import RecentlyViewed from "./RecentlyViewed";
import { completeRitual } from "@/lib/ritual";
import { type Product } from "@/data/products";
import { useI18n } from "@/i18n/client";

// Placeholder policies (in the dictionaries) — confirm shipping, returns and patch-test wording with the client.
export default function ProductExtras({ product: base }: { product: Product }) {
  const i = useI18n();
  const { t } = i;
  const product = i.product(base);
  // The steps this product does not cover, for the same time of day.
  const pairs = completeRitual([product.slug]);
  const faq = [{ q: i.fmt(t.extras.howToUse, { name: product.name }), a: product.howToUse }, ...t.extras.faq];

  return (
    <>
      <Reviews product={product.slug} productName={product.name} />

      <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10">
        <Reveal className="flex items-end justify-between gap-6">
          <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)]">{t.extras.complete}</h2>
          <Link href="/routine" className="shrink-0 text-sm underline decoration-apricot decoration-[1.5px] underline-offset-[6px] hover:text-ember">
            {t.extras.build}
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {pairs.map((p, n) => (
            <Reveal key={p.slug} delay={n * 120}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
          <Reveal>
            <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)]">{t.extras.questions}</h2>
            <p className="mt-5 max-w-xs text-smoke">
              {t.extras.askPre}
              <Link href="/contact" className="text-ink underline underline-offset-4 hover:text-ember">
                {t.extras.ask}
              </Link>
              {t.extras.askPost}
            </p>
          </Reveal>
          <div className="border-t border-mist">
            {faq.map((f) => (
              <details key={f.q} className="faq group border-b border-mist">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[19px] font-light tracking-[-0.03em] text-ink">
                  {f.q}
                  <span aria-hidden className="faq-icon relative h-3 w-3 shrink-0" />
                </summary>
                <p className="max-w-[60ch] pb-6 text-smoke">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <RecentlyViewed exclude={product.slug} />
    </>
  );
}
