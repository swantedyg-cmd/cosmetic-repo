"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { LAB_MADE, ORIGINS } from "@/data/origins";
import { useDevice } from "@/lib/useDevice";
import { useInView } from "@/lib/useInView";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/i18n/client";
import { activeName } from "@/i18n/localize";

const GlobeScene = dynamic(() => import("./three/GlobeScene"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full animate-pulse rounded-full bg-blush" />,
});

/** Where it comes from: a list of origins beside a globe that turns to each one. */
export default function OriginsGlobe() {
  const [active, setActive] = useState(0);
  const { quality, reducedMotion } = useDevice();
  const [ref, inView] = useInView<HTMLDivElement>();
  const night = useTheme() === "night";
  const i = useI18n();
  const { t } = i;
  const origins = useMemo(
    () =>
      ORIGINS.map((o) => ({
        ...o,
        ...t.catalog.origins[o.ingredient],
        key: o.ingredient,
        ingredient: activeName(o.ingredient, t),
      })),
    [t],
  );
  const o = origins[active];

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10" aria-labelledby="origins-title">
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-end">
        <h2 id="origins-title" className="display text-[clamp(2.4rem,4.6vw,3.75rem)] text-balance">
          {t.origins.title}
        </h2>
        <p className="max-w-sm text-smoke">
          {t.origins.body}
        </p>
      </div>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="order-2 lg:order-1">
          <ul className="flex flex-wrap gap-2" role="list">
            {origins.map((origin, n) => (
              <li key={origin.key}>
                <button
                  type="button"
                  aria-pressed={n === active}
                  onClick={() => setActive(n)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    n === active ? "border-ink bg-ink text-canvas" : "border-ink/20 hover:border-ink"
                  }`}
                >
                  {origin.ingredient}
                </button>
              </li>
            ))}
          </ul>

          <div key={o.key} className="origin-card mt-8 border-t border-mist pt-6" aria-live="polite">
            <p className="text-sm text-smoke">
              {o.source} · {o.place}
            </p>
            <p className="display mt-2 text-[clamp(2rem,3.6vw,2.8rem)]">{o.ingredient}</p>
            <p className="mt-4 max-w-[46ch] leading-relaxed">{o.story}</p>
            <p className="label mt-4 tabular-nums text-smoke">
              {i.num(Math.abs(o.lat), 1)}° {o.lat >= 0 ? t.origins.north : t.origins.south} · {i.num(Math.abs(o.lng), 1)}°{" "}
              {o.lng >= 0 ? t.origins.east : t.origins.west}
            </p>
          </div>

          <div className="mt-10 rounded-[10px] border border-mist p-5">
            <p className="text-sm text-ink">{t.origins.labTitle}</p>
            <p className="mt-1 text-sm text-smoke">
              {t.origins.labBody}
            </p>
            <p className="mt-3 text-sm">{LAB_MADE.map((n) => activeName(n, t)).join(" · ")}</p>
          </div>
        </div>

        <div ref={ref} className="relative order-1 mx-auto aspect-square w-full max-w-[560px] lg:order-2">
          <GlobeScene
            origins={origins}
            active={active}
            onPick={setActive}
            quality={quality}
            reducedMotion={reducedMotion}
            inView={inView}
            night={night}
          />
        </div>
      </div>
      <p className="mt-6 text-xs text-smoke">{t.origins.note}</p>
    </section>
  );
}
