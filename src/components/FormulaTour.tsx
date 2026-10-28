"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { featured, formatPrice } from "@/data/products";
import { useDevice } from "@/lib/useDevice";
import { useInView } from "@/lib/useInView";

const TourScene = dynamic(() => import("./three/TourScene"), { ssr: false });

// A pinned 3D stage: scrolling through it turns the bottle and walks through
// each featured formula: the cap lifts and its actives rise out as droplets
// sized by their real percentages, then it closes before the next one arrives.
export default function FormulaTour() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);
  const { quality, reducedMotion } = useDevice();
  const [stageRef, inView] = useInView<HTMLDivElement>();

  useEffect(() => {
    const onScroll = () => {
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / travel));
      progress.current = p;
      setStage(Math.min(featured.length - 1, Math.floor(p * featured.length)));
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
    <section ref={section} style={{ height: `${featured.length * 100}svh` }} className="relative">
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <TourScene
            active={inView}
            products={featured}
            stage={stage}
            progress={progress}
            quality={quality}
            reducedMotion={reducedMotion}
          />
        </div>

        <p className="pointer-events-none absolute left-5 top-28 text-sm text-smoke md:left-10 lg:left-16">
          Inside the formula
        </p>

        {featured.map((p, i) => (
          <div key={p.slug}>
            <Panel visible={stage === i} className="justify-end pb-[6svh] md:justify-center md:pb-0">
              <div className="max-w-sm rounded-[10px] border border-mist bg-canvas/85 p-5 backdrop-blur-md md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
                <p className="text-sm text-smoke">
                  {p.kind} · {p.variants.at(-1)!.label}
                </p>
                <h2 className="display mt-3 text-[clamp(2.2rem,4.6vw,3.6rem)]">{p.name}</h2>
                <p className="mt-4 hidden max-w-[30ch] text-smoke sm:block">{p.tagline}</p>
                {/* Actives are labelled on the 3D droplets on desktop; listed here on phones. */}
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm lg:hidden">
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
          </div>
        ))}

        <ol className="absolute bottom-8 right-10 hidden gap-5 md:flex" aria-label="Featured formulas">
          {featured.map((p, i) => (
            <li
              key={p.slug}
              className={`flex items-center gap-2 text-xs transition-colors duration-500 ${
                stage === i ? "text-ink" : "text-smoke"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                  stage === i ? "bg-ember" : "bg-mist"
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
