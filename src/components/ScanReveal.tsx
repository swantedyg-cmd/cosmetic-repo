"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "@/i18n/Link";
import { useI18n } from "@/i18n/client";
import type { Product } from "@/data/products";
import type { Timeline } from "./three/ScanScene";
import { useCart } from "@/lib/cart";
import { recordView } from "@/lib/recent";
import { sceneColors, useTheme } from "@/lib/theme";
import { useDevice } from "@/lib/useDevice";

const ScanScene = dynamic(() => import("./three/ScanScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-blush-2" />,
});

/** Where a printed code lands: the scanned code becomes the bottle, then the product appears. */
export default function ScanReveal({ product: base, modules }: { product: Product; modules: string[] }) {
  const i = useI18n();
  const { t } = i;
  const product = i.product(base);
  const variant = product.variants[0];
  const { quality, reducedMotion } = useDevice();
  const theme = useTheme();
  const { add } = useCart();
  const [formed, setFormed] = useState(false);
  const [opened, setOpened] = useState(false);
  const [added, setAdded] = useState(false);
  const timeline = useRef<Timeline>({ start: null, skip: false });
  const maxPercent = Math.max(...product.actives.map((a) => a.percent));

  useEffect(() => recordView(product.slug), [product.slug]);

  const replay = () => {
    setOpened(false);
    setFormed(false);
    timeline.current.start = null;
    timeline.current.skip = false;
  };
  const skip = () => {
    timeline.current.skip = true;
  };

  // Staggered entrance for the copy once the bottle has formed.
  const enter = (n: number) => ({
    className: `transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
      formed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
    }`,
    style: { transitionDelay: formed ? `${n * 90}ms` : "0ms" },
  });

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-20 pt-24 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-16 md:px-12 md:pt-32">
      <div className="relative h-[58svh] overflow-hidden rounded-[15px] bg-blush-2 md:h-[calc(100svh-10rem)]">
        <ScanScene
          product={product}
          color={product.color}
          modules={modules}
          quality={quality}
          reducedMotion={reducedMotion}
          opened={opened}
          timeline={timeline}
          formed={formed}
          onFormed={() => setFormed(true)}
          background={sceneColors[theme].viewer}
        />
        <p role="status" className="label pointer-events-none absolute start-5 top-5 flex items-center gap-2 text-smoke">
          <span className={`inline-block size-1.5 rounded-full bg-ember ${formed ? "" : "animate-pulse"}`} aria-hidden />
          {formed ? t.scan.scanned : t.scan.scanning}
        </p>
        {formed ? (
          <button
            type="button"
            aria-pressed={opened}
            onClick={() => setOpened((o) => !o)}
            className="btn btn-white absolute end-4 top-4 !px-5 !py-2.5"
          >
            {opened ? t.product.close : t.product.open}
          </button>
        ) : (
          <button type="button" onClick={skip} className="label absolute end-5 top-5 text-smoke underline-offset-4 hover:text-ink hover:underline">
            {t.scan.skip}
          </button>
        )}
        {formed && (
          <p className="label pointer-events-none absolute bottom-4 start-5 text-smoke">{t.product.dragToTurn}</p>
        )}
      </div>

      <div aria-hidden={!formed} inert={!formed}>
        <p {...enter(0)}>
          <span className="label text-smoke">{product.kind}</span>
        </p>
        <h1 {...enter(1)} className={`mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-light leading-none tracking-tight ${enter(1).className}`}>
          {product.name}
        </h1>
        <p {...enter(2)} className={`mt-4 text-lg text-smoke ${enter(2).className}`}>
          {product.tagline}
        </p>

        <ul {...enter(3)} className={`mt-8 space-y-3 border-t border-mist pt-6 ${enter(3).className}`} aria-label={t.product.actives}>
          {product.actives.map((a) => (
            <li key={a.name} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5">
              <span className="text-sm">{a.name}</span>
              <span className="numeric label text-ember">{i.num(a.percent)}%</span>
              <span className="col-span-2 h-[3px] overflow-hidden rounded-full bg-mist">
                <span
                  className="block h-full rounded-full bg-ember transition-[width] delay-500 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ width: formed ? `${Math.max(4, (a.percent / maxPercent) * 100)}%` : "0%" }}
                />
              </span>
            </li>
          ))}
        </ul>

        <div {...enter(4)} className={`mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 ${enter(4).className}`}>
          <button
            type="button"
            onClick={() => {
              add(product.slug, variant.id);
              setAdded(true);
            }}
            className="btn"
          >
            {i.fmt(t.product.addPrice, { price: i.price(variant.price) })}
          </button>
          {added ? (
            <Link href="/cart" role="status" className="text-sm underline underline-offset-4">
              {t.product.addedView}
            </Link>
          ) : (
            product.variants.length > 1 && <span className="text-sm text-smoke">{variant.label}</span>
          )}
        </div>

        <div {...enter(5)} className={`mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm ${enter(5).className}`}>
          <Link href={`/shop/${product.slug}`} className="underline underline-offset-4 hover:text-ember">
            {t.scan.details}
          </Link>
          {!reducedMotion && (
            <button type="button" onClick={replay} className="text-smoke underline-offset-4 hover:text-ink hover:underline">
              {t.scan.replay}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
