"use client";

import Link from "@/i18n/Link";
import Reveal from "./Reveal";
import { getProduct } from "@/data/products";
import { useI18n } from "@/i18n/client";

// Keep the jar, buy the refill. Savings are worked out from the real catalogue prices.
const jarBase = getProduct("veil-barrier-cream")!;
const full = jarBase.variants.find((v) => v.id !== "refill")!.price;
const refill = jarBase.variants.find((v) => v.id === "refill")!.price;
const REFILLS_A_YEAR = 6;

export default function Refill() {
  const i = useI18n();
  const { t } = i;
  const jar = i.product(jarBase);
  const prices = [full, refill, 0];

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10">
      <div className="grid items-center gap-12 rounded-[15px] bg-blush p-6 md:grid-cols-[1fr_1.1fr] md:gap-16 md:p-14">
        {/* A pod drops into the jar and the level rises, on a slow loop. */}
        <Reveal className="relative mx-auto aspect-square w-full max-w-[380px]">
          <div data-loop className="refill-scene" aria-hidden>
            <span className="refill-pod" />
            <span className="refill-lid" />
            <span className="refill-jar">
              <span className="refill-level" />
            </span>
            <span className="refill-shadow" />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-sm text-ink/60">{t.refill.eyebrow}</p>
            <h2 className="display mt-3 text-[clamp(2.2rem,4.4vw,3.25rem)]">{t.refill.title}</h2>
            <p className="mt-6 flex items-baseline gap-3">
              <span className="numeric text-[64px] font-extralight leading-none tracking-[-0.06em] text-ember tabular-nums">
                {i.price((full - refill) * REFILLS_A_YEAR)}
              </span>
              <span className="max-w-[18ch] text-sm text-ink/60">{i.plural(t.refill.saved, REFILLS_A_YEAR)}</span>
            </p>
          </Reveal>
          <ol className="mt-10 border-t border-ink/15">
            {t.refill.steps.map((s, n) => (
              <li key={s.title}>
                <Reveal delay={n * 110} className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-ink/15 py-5">
                  <span className="text-xs text-ink/60">{i.fmt(t.common.step, { n: n + 1 })}</span>
                  <span>
                    <span className="block text-[19px] font-light tracking-[-0.03em] text-ink">{s.title}</span>
                    <span className="mt-1 block text-sm text-ink/70">
                      {i.fmt(s.body, { name: jar.name, price: i.price(prices[n]) })}
                    </span>
                  </span>
                </Reveal>
              </li>
            ))}
          </ol>
          <Link href={`/shop/${jar.slug}`} className="btn mt-8">
            {t.refill.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
