"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { editorial, productPhotos, type Photo } from "@/data/photos";

type Frame = { photo: Photo; caption: string; href?: string; size: "tall" | "wide" | "small" };

const FRAMES: Frame[] = [
  { photo: editorial.glass, caption: "Behind the glass", size: "tall" },
  { photo: productPhotos["ember-facial-oil"][0], caption: "Ember Facial Oil, 30 ml", href: "/shop/ember-facial-oil", size: "small" },
  { photo: editorial.applying, caption: "Two pumps, pressed in", href: "/shop/dew-serum", size: "wide" },
  { photo: productPhotos["veil-barrier-cream"][0], caption: "Veil Barrier Cream", href: "/shop/veil-barrier-cream", size: "tall" },
  { photo: editorial.freckles, caption: "Bare skin, morning light", size: "small" },
  { photo: productPhotos["tint-balm"][1], caption: "Tint Balm in Rose, Coral, Cocoa", href: "/shop/tint-balm", size: "wide" },
  { photo: editorial.portrait, caption: "Nothing to cover", size: "tall" },
];

const SIZE: Record<Frame["size"], string> = {
  tall: "h-[62svh] w-[min(42svh,78vw)]",
  wide: "h-[46svh] w-[min(66svh,86vw)]",
  small: "h-[36svh] w-[min(28svh,60vw)] self-end",
};

// A pinned strip of photographs that travels sideways as you scroll down.
// Each picture also drifts inside its frame, so the strip reads in depth.
export default function Lookbook() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wide = matchMedia("(min-width: 768px)");
    let id = 0;
    const update = () => {
      id = 0;
      const el = section.current;
      const t = track.current;
      if (!el || !t) return;
      if (!wide.matches) {
        t.style.transform = "";
        return;
      }
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / travel));
      const distance = t.scrollWidth - window.innerWidth;
      t.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
      t.querySelectorAll<HTMLElement>("[data-drift]").forEach((img) => {
        const r = img.parentElement!.getBoundingClientRect();
        const centre = (r.left + r.width / 2) / window.innerWidth - 0.5;
        img.style.transform = `translate3d(${centre * -12}%, 0, 0) scale(1.25)`;
      });
    };
    const schedule = () => {
      if (!id) id = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <section ref={section} className="relative bg-[#fbe9dc] md:h-[320svh]" aria-label="Lookbook">
      <div className="overflow-x-auto md:sticky md:top-0 md:h-svh md:overflow-hidden">
        <div
          ref={track}
          className="flex h-full w-max items-center gap-6 px-5 py-20 will-change-transform md:gap-10 md:px-16 md:py-0"
        >
          <div className="flex w-[78vw] shrink-0 flex-col justify-center md:w-[34vw] md:pr-10">
            <p className="text-sm text-ink/60">Lookbook</p>
            <h2 className="display mt-4 text-[clamp(2.8rem,6vw,5.5rem)]">
              Worn in
              <br />
              daylight
            </h2>
            <p className="mt-6 max-w-[30ch] text-ink/70">
              No retouching on skin, no filters on glass. Keep scrolling to walk the set.
            </p>
          </div>

          {FRAMES.map((f) => {
            const body = (
              <>
                <div className={`relative overflow-hidden rounded-[15px] bg-[#f3d6c3] ${SIZE[f.size]}`}>
                  <Image
                    data-drift
                    src={f.photo.src}
                    alt={f.photo.alt}
                    fill
                    sizes="(min-width: 768px) 45vw, 85vw"
                    className="scale-125 object-cover will-change-transform"
                  />
                </div>
                <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm text-ink">
                  {f.caption}
                  {f.href && <span className="text-ink/40 transition-colors group-hover:text-ember">Shop →</span>}
                </figcaption>
              </>
            );
            return (
              <figure key={f.caption} className={`shrink-0 ${f.size === "small" ? "self-end md:mb-[14svh]" : ""}`}>
                {f.href ? (
                  <Link href={f.href} data-cursor="Shop" className="group block">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </figure>
            );
          })}
          <div className="w-px shrink-0" />
        </div>
      </div>
    </section>
  );
}
