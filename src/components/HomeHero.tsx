"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { brandStat, featured, formatPrice } from "@/data/products";
import { useDevice } from "@/lib/useDevice";

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });

const STAGES = featured.length + 1;

// A tall section with a pinned 3D stage: scrolling through it walks the bottle
// from the brand intro through each featured formula.
export default function HomeHero() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);
  const { quality, reducedMotion } = useDevice();

  useEffect(() => {
    const onScroll = () => {
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / travel));
      progress.current = p;
      setStage(Math.min(STAGES - 1, Math.floor(p * STAGES)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={section} style={{ height: `${STAGES * 100}svh` }} className="relative">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <HeroScene
            products={featured}
            stage={stage}
            progress={progress}
            quality={quality}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Intro */}
        <Panel visible={stage === 0} className="justify-end pb-10 md:pb-14">
          <div className="flex items-end justify-between gap-8">
            <div>
              <h1 className="display max-w-[11ch] text-[clamp(2.4rem,4.6vw,4rem)] !leading-[1]">
                Formulas you can see through
              </h1>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link href="/shop" className="btn">Shop the formulas</Link>
                <span className="hidden text-sm text-smoke sm:inline">Scroll to turn the bottle ↓</span>
              </div>
            </div>
          </div>
        </Panel>
        <Annotations
          visible={stage === 0}
          items={[{ value: brandStat.value, label: "Natural origin" }, { value: "0%", label: "Fragrance" }]}
        />

        {featured.map((p, i) => (
          <div key={p.slug}>
            <Panel visible={stage === i + 1} className="justify-end pb-[6svh] md:justify-center md:pb-0">
              <div className="max-w-sm rounded-[10px] border border-mist bg-canvas/85 p-5 backdrop-blur-md md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
                <p className="text-sm text-smoke">
                  {p.kind} · {p.variants.at(-1)!.label}
                </p>
                <h2 className="display mt-3 text-[clamp(2rem,4.4vw,3.6rem)]">{p.name}</h2>
                <p className="mt-4 hidden max-w-[30ch] text-smoke sm:block">{p.tagline}</p>
                {/* Actives sit beside the bottle on desktop; listed here on phones. */}
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm md:hidden">
                  {p.actives.map((a) => (
                    <li key={a.name}>
                      <span className="tabular-nums">{a.percent}%</span> <span className="text-smoke">{a.name}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-5">
                  <Link href={`/shop/${p.slug}`} className="btn">See the formula</Link>
                  <span className="text-sm">from {formatPrice(p.variants[0].price)}</span>
                </div>
              </div>
            </Panel>
            <Annotations
              visible={stage === i + 1}
              items={p.actives.map((a) => ({ value: `${a.percent}%`, label: a.name }))}
            />
          </div>
        ))}

        {/* Which formula you're on */}
        <ol className="absolute bottom-8 right-10 hidden gap-5 md:flex" aria-label="Featured formulas">
          {featured.map((p, i) => (
            <li
              key={p.slug}
              className={`flex items-center gap-2 text-xs transition-colors duration-500 ${
                stage === i + 1 ? "text-ink" : "text-smoke"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                  stage === i + 1 ? "bg-ember" : "bg-mist"
                }`}
              />
              {p.name}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Gallery-label callouts that hang off a hairline to the right of the bottle.
function Annotations({ visible, items }: { visible: boolean; items: { value: string; label: string }[] }) {
  return (
    <ul
      aria-hidden={!visible}
      className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 flex-col gap-7 lg:flex xl:right-16"
    >
      {items.map((item, i) => (
        <li
          key={item.label}
          style={{ transitionDelay: visible ? `${200 + i * 120}ms` : "0ms" }}
          className={`flex items-center gap-4 transition-all duration-700 ${
            visible ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
          }`}
        >
          <span className="h-px w-14 bg-graphite" />
          <span>
            <span className="block text-[32px] font-extralight leading-none tracking-[-0.05em] text-ink tabular-nums">
              {item.value}
            </span>
            <span className="mt-1 block text-xs text-smoke">{item.label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Panel({
  visible,
  className,
  children,
}: {
  visible: boolean;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none absolute inset-0 flex flex-col px-5 pt-28 transition-all duration-700 md:px-10 lg:px-16 ${className} ${
        visible ? "opacity-100 [&>*]:pointer-events-auto" : "translate-y-4 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
