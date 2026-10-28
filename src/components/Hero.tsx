"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { brandStat, products } from "@/data/products";
import { useDevice } from "@/lib/useDevice";
import { useInView } from "@/lib/useInView";

const HeroStudio = dynamic(() => import("./three/HeroStudio"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#fbe9dc]" />,
});

export default function Hero() {
  const { quality, reducedMotion } = useDevice();
  const [ref, inView] = useInView<HTMLElement>();
  const exit = useRef(0);

  // How far the hero has scrolled out, read by the 3D set every frame (no re-renders).
  useEffect(() => {
    const onScroll = () => {
      exit.current = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={ref} className="relative h-svh min-h-[640px] overflow-hidden bg-[#fbe9dc]">
      <div className="absolute inset-0">
        <HeroStudio quality={quality} reducedMotion={reducedMotion} active={inView} exit={exit} />
      </div>

      {/* Stat annotations, hung off hairlines like gallery labels */}
      <ul className="pointer-events-none absolute right-10 top-32 hidden flex-col gap-6 lg:flex xl:right-16">
        {[
          { value: brandStat.value, label: "Percentage of natural ingredients" },
          { value: String(products.length), label: "Formulas. Nothing more." },
        ].map((a, i) => (
          <li
            key={a.label}
            className="reveal flex items-center gap-4"
            style={{ animationDelay: `calc(var(--intro) + ${1200 + i * 150}ms)` }}
          >
            <span className="h-px w-14 bg-ink/60" />
            <span>
              <span className="block text-[32px] font-extralight leading-none tracking-[-0.05em] text-ink tabular-nums">
                {a.value}
              </span>
              <span className="mt-1 block max-w-[16ch] text-xs text-ink/60">{a.label}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* Headline, bottom-left */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-14 lg:px-16">
        <h1 className="display text-[clamp(2.4rem,min(5vw,10svh),4.75rem)] !leading-[0.98]">
          <span className="reveal-line block overflow-hidden">
            <span className="block" style={{ animationDelay: "calc(var(--intro) + 500ms)" }}>Skincare you can</span>
          </span>{" "}
          <span className="reveal-line block overflow-hidden">
            <span className="block" style={{ animationDelay: "calc(var(--intro) + 620ms)" }}>see through</span>
          </span>
        </h1>
        <p className="reveal mt-5 max-w-[34ch] text-ink/70" style={{ animationDelay: "calc(var(--intro) + 850ms)" }}>
          Clear glass, short formulas, and every active printed at its exact percentage.
        </p>
        <div className="reveal pointer-events-auto mt-7 flex flex-wrap items-center gap-5" style={{ animationDelay: "calc(var(--intro) + 1000ms)" }}>
          <Link href="/shop" className="btn btn-white">Shop the formulas</Link>
          <span className="hidden text-sm text-ink/60 md:inline">Click a bottle to open it</span>
        </div>
      </div>
    </section>
  );
}
