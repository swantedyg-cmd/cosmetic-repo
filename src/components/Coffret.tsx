"use client";

import { useEffect, useRef, useState } from "react";
import { useSectionScroll } from "@/lib/useSectionScroll";
import dynamic from "next/dynamic";
import Link from "@/i18n/Link";
import { getProduct } from "@/data/products";
import { useI18n } from "@/i18n/client";
import { useCart } from "@/lib/cart";
import { useDevice } from "@/lib/useDevice";
import { useInView } from "@/lib/useInView";

const CoffretScene = dynamic(() => import("./three/CoffretScene"), { ssr: false });

// The evening ritual, in the order it goes on, at its smallest size.
const SET_BASE = ["ember-facial-oil", "dew-serum", "veil-barrier-cream"].map((s) => getProduct(s)!);
const TOTAL = SET_BASE.reduce((sum, p) => sum + p.variants[0].price, 0);

/** Scroll position (0 → 1) where each caption takes over: wrapped, opening, open. */
const CHAPTERS = [0, 0.2, 0.55];

// A pinned 3D gift box. Scrolling unties the ribbon, lifts the lid and raises the
// evening ritual out of its velvet bed; the last chapter adds the whole set to the bag.
export default function Coffret() {
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);
  const section = useSectionScroll<HTMLElement>((p) => {
    progress.current = p;
    setChapter(CHAPTERS.findLastIndex((c) => p >= c));
  });
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const { quality, reducedMotion } = useDevice();
  const [stageRef, inView, near] = useInView<HTMLDivElement>({ lazy: true });
  const i = useI18n();
  const { t } = i;
  const SET = i.products(SET_BASE);

  useEffect(() => {
    if (!added) return;
    const id = window.setTimeout(() => setAdded(false), 2400);
    return () => window.clearTimeout(id);
  }, [added]);

  const addSet = () => {
    SET.forEach((p) => add(p.slug, p.variants[0].id));
    setAdded(true);
  };

  return (
    <section ref={section} className="keep-day coffret relative h-[320svh] text-canvas" aria-labelledby="coffret-title">
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          {near && (
            <CoffretScene
              products={SET}
              progress={progress}
              quality={quality}
              reducedMotion={reducedMotion}
              active={inView}
              lid={t.coffret.lid}
              rtl={i.rtl}
            />
          )}
        </div>

        <Chapter visible={chapter === 0}>
          <p className="text-sm text-gold">{t.coffret.eyebrow}</p>
          <h2 id="coffret-title" className="display foil mt-3 text-[clamp(2.6rem,6vw,5rem)]">
            {t.coffret.title}
          </h2>
          <p className="mt-5 max-w-[34ch] text-canvas/60">
            {t.coffret.body}
          </p>
        </Chapter>

        <Chapter visible={chapter === 1}>
          <p className="text-sm text-gold">{t.coffret.eyebrow2}</p>
          <p className="display foil mt-3 text-[clamp(2.6rem,6vw,5rem)]">{t.coffret.title2}</p>
          <p className="mt-5 max-w-[34ch] text-canvas/60">
            {t.coffret.body2}
          </p>
        </Chapter>

        <Chapter visible={chapter === 2}>
          <p className="text-sm text-gold">{t.coffret.eyebrow3}</p>
          <p className="display foil mt-3 text-[clamp(2.6rem,6vw,5rem)]">{t.coffret.title3}</p>
          <ol className="mt-6 max-w-sm border-t border-gold/25">
            {SET.map((p, n) => (
              <li key={p.slug} className="flex items-baseline gap-5 border-b border-gold/25 py-3">
                <span className="shrink-0 text-xs text-canvas/45">{i.fmt(t.common.step, { n: n + 1 })}</span>
                <Link href={`/shop/${p.slug}`} className="text-[19px] font-extralight tracking-[-0.03em] transition-colors hover:text-gold">
                  {p.name}
                </Link>
                <span className="ms-auto shrink-0 text-sm tabular-nums text-canvas/50">{p.variants[0].label}</span>
              </li>
            ))}
          </ol>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <button type="button" onClick={addSet} className="btn btn-gold min-w-[13.5rem]">
              {added ? t.coffret.added : t.coffret.add}
            </button>
            <span className="text-sm tabular-nums text-canvas/70">{i.price(TOTAL)}</span>
          </div>
          <p className="sr-only" aria-live="polite">
            {added ? t.coffret.addedStatus : ""}
          </p>
        </Chapter>

        <ol className="absolute bottom-8 end-5 flex gap-2 md:end-10" aria-hidden>
          {CHAPTERS.map((c, n) => (
            <li
              key={c}
              className={`h-px w-8 transition-colors duration-700 ${chapter >= n ? "bg-gold" : "bg-canvas/20"}`}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Chapter({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none absolute inset-0 flex flex-col justify-end px-5 pb-[8svh] transition-all duration-700 md:justify-center md:px-10 md:pb-0 lg:px-16 ${
        visible ? "opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div
        className={`max-w-md rounded-[10px] bg-ink/70 p-5 backdrop-blur-md md:bg-transparent md:p-0 md:backdrop-blur-none ${
          visible ? "pointer-events-auto" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
