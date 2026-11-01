"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LAB_MADE, ORIGINS } from "@/data/origins";
import { useDevice } from "@/lib/useDevice";
import { useInView } from "@/lib/useInView";
import { useTheme } from "@/lib/theme";

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
  const o = ORIGINS[active];

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10" aria-labelledby="origins-title">
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-end">
        <h2 id="origins-title" className="display text-[clamp(2.4rem,4.6vw,3.75rem)] text-balance">
          Where it comes from
        </h2>
        <p className="max-w-sm text-smoke">
          The plant and mineral actives, traced back to where they’re grown or dug. Pick one, or drag the globe.
        </p>
      </div>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="order-2 lg:order-1">
          <ul className="flex flex-wrap gap-2" role="list">
            {ORIGINS.map((origin, i) => (
              <li key={origin.ingredient}>
                <button
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    i === active ? "border-ink bg-ink text-canvas" : "border-ink/20 hover:border-ink"
                  }`}
                >
                  {origin.ingredient}
                </button>
              </li>
            ))}
          </ul>

          <div key={o.ingredient} className="origin-card mt-8 border-t border-mist pt-6" aria-live="polite">
            <p className="text-sm text-smoke">
              {o.source} · {o.place}
            </p>
            <p className="display mt-2 text-[clamp(2rem,3.6vw,2.8rem)]">{o.ingredient}</p>
            <p className="mt-4 max-w-[46ch] leading-relaxed">{o.story}</p>
            <p className="label mt-4 tabular-nums text-smoke">
              {Math.abs(o.lat).toFixed(1)}° {o.lat >= 0 ? "N" : "S"} · {Math.abs(o.lng).toFixed(1)}° {o.lng >= 0 ? "E" : "W"}
            </p>
          </div>

          <div className="mt-10 rounded-[10px] border border-mist p-5">
            <p className="text-sm text-ink">Made in the lab, on purpose</p>
            <p className="mt-1 text-sm text-smoke">
              Purer and steadier than plant extracts, and no pressure on wild plants:
            </p>
            <p className="mt-3 text-sm">{LAB_MADE.join(" · ")}</p>
          </div>
        </div>

        <div ref={ref} className="relative order-1 mx-auto aspect-square w-full max-w-[560px] lg:order-2">
          <GlobeScene
            origins={ORIGINS}
            active={active}
            onPick={setActive}
            quality={quality}
            reducedMotion={reducedMotion}
            inView={inView}
            night={night}
          />
        </div>
      </div>
      <p className="mt-6 text-xs text-smoke">Sourcing regions shown are for illustration.</p>
    </section>
  );
}
