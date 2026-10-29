"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, products } from "@/data/products";
import { useDevice } from "@/lib/useDevice";
import { useInView } from "@/lib/useInView";

const VitrineScene = dynamic(() => import("./three/VitrineScene"), { ssr: false });

const N = products.length;
const STEP = (Math.PI * 2) / N;
/** Seconds between turns when nobody is touching the table. */
const AUTO_TURN = 6;

// The whole range on a jeweller's turntable. Drag to turn it, tap a bottle to bring
// it forward, tap the front bottle to open its page. It turns on its own when idle.
export default function Vitrine() {
  const router = useRouter();
  const { quality, reducedMotion } = useDevice();
  const [stageRef, inView] = useInView<HTMLDivElement>();
  const [turn, setTurn] = useState(0);
  const [touched, setTouched] = useState(false);
  const [hovering, setHovering] = useState(false);
  const drag = useRef(0);
  const pointer = useRef<{ x: number; moved: boolean } | null>(null);
  const front = ((turn % N) + N) % N;
  const p = products[front];

  // Idle turning restarts its clock after every manual turn.
  useEffect(() => {
    if (!inView || reducedMotion || hovering) return;
    const id = window.setTimeout(() => setTurn((t) => t + 1), AUTO_TURN * 1000);
    return () => window.clearTimeout(id);
  }, [inView, reducedMotion, hovering, turn]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const width = e.currentTarget.clientWidth;
    pointer.current = { x: e.clientX, moved: false };
    const move = (ev: PointerEvent) => {
      const s = pointer.current;
      if (!s) return;
      const dx = ev.clientX - s.x;
      if (Math.abs(dx) > 6) s.moved = true;
      // A full-width swipe turns the table half way round.
      drag.current = (dx / width) * Math.PI;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const steps = Math.round(drag.current / STEP);
      // Keep the current angle so the platter settles from where it was let go.
      if (steps !== 0) {
        setTurn((t) => t - steps);
        setTouched(true);
      }
      drag.current = 0;
      // Let the click that ends a drag through the next frame before clearing.
      requestAnimationFrame(() => (pointer.current = null));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const pick = (i: number) => {
    if (pointer.current?.moved) return;
    if (i === front) {
      router.push(`/shop/${products[i].slug}`);
      return;
    }
    // Turn the short way round.
    const delta = ((i - front + N + Math.floor(N / 2)) % N) - Math.floor(N / 2);
    setTurn((t) => t + delta);
    setTouched(true);
  };

  return (
    <section className="bg-ink text-canvas" aria-labelledby="vitrine-title">
      <div
        ref={stageRef}
        className="relative h-[100svh] min-h-[640px] overflow-hidden"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
        onPointerLeave={() => setHovering(false)}
      >
        <div className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing" onPointerDown={onPointerDown} aria-hidden>
          <VitrineScene
            products={products}
            turn={turn}
            drag={drag}
            quality={quality}
            reducedMotion={reducedMotion}
            active={inView}
            onPick={pick}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-[1280px] px-5 pt-16 md:px-10 md:pt-20">
          <p className="text-sm text-gold">The vitrine</p>
          <h2 id="vitrine-title" className="display mt-3 max-w-[14ch] text-[clamp(2.2rem,4.4vw,3.25rem)] !text-canvas">
            The whole range, under glass
          </h2>
          <p
            className={`mt-4 text-sm text-canvas/50 transition-opacity duration-700 ${touched ? "opacity-0" : "opacity-100"}`}
          >
            Drag to turn the table
          </p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/70 to-transparent pt-24">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-6 px-5 pb-10 md:px-10 md:pb-14">
            {/* Keyed so each product's details fade up as it reaches the front. */}
            <div key={p.slug} className="vitrine-caption min-w-0" aria-live="polite">
              <p className="text-sm text-canvas/50">
                {p.kind} · {p.variants.at(-1)!.label}
              </p>
              <p className="display mt-2 text-[clamp(2.4rem,6vw,4.5rem)] !text-canvas">{p.name}</p>
              <p className="mt-2 max-w-[34ch] text-canvas/60">{p.tagline}</p>
            </div>
            <div className="pointer-events-auto flex items-center gap-3">
              <span className="mr-2 text-sm tabular-nums text-canvas/70">from {formatPrice(p.variants[0].price)}</span>
              <Link href={`/shop/${p.slug}`} className="btn btn-white">
                View {p.name}
              </Link>
              <TurnButton label="Previous product" onClick={() => setTurn((t) => t - 1)} flip />
              <TurnButton label="Next product" onClick={() => setTurn((t) => t + 1)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TurnButton({ label, onClick, flip }: { label: string; onClick: () => void; flip?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-12 w-12 place-items-center rounded-full border border-gold/50 text-gold transition-colors hover:border-gold hover:bg-gold hover:text-ink"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={flip ? "rotate-180" : ""}>
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
