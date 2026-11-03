"use client";

import { useRef } from "react";
import { useSectionScroll } from "@/lib/useSectionScroll";
import Image from "next/image";
import Link from "@/i18n/Link";
import { useI18n } from "@/i18n/client";
import type { Dictionary } from "@/i18n";
import { editorial, productPhotos, type Photo } from "@/data/photos";

type Frame = { photo: Photo; caption: keyof Dictionary["lookbook"]["captions"]; href?: string; size: "tall" | "wide" | "small" };

const FRAMES: Frame[] = [
  { photo: editorial.glass, caption: "glass", size: "tall" },
  { photo: productPhotos["ember-facial-oil"][0], caption: "ember", href: "/shop/ember-facial-oil", size: "small" },
  { photo: editorial.applying, caption: "applying", href: "/shop/dew-serum", size: "wide" },
  { photo: productPhotos["veil-barrier-cream"][0], caption: "veil", href: "/shop/veil-barrier-cream", size: "tall" },
  { photo: editorial.freckles, caption: "freckles", size: "small" },
  { photo: productPhotos["tint-balm"][1], caption: "tint", href: "/shop/tint-balm", size: "wide" },
  { photo: editorial.portrait, caption: "portrait", size: "tall" },
];

const SIZE: Record<Frame["size"], string> = {
  tall: "h-[62svh] w-[min(42svh,78vw)]",
  wide: "h-[46svh] w-[min(66svh,86vw)]",
  small: "h-[36svh] w-[min(28svh,60vw)] self-end",
};

// A pinned strip of photographs that travels sideways as you scroll down.
// Each picture also drifts inside its frame, so the strip reads in depth.
export default function Lookbook() {
  const i = useI18n();
  const { t } = i;
  const track = useRef<HTMLDivElement>(null);
  // Cached on measure: how far the strip travels, which way, where it rests on screen,
  // and each frame's centre along it.
  const layout = useRef({ wide: false, distance: 0, sign: -1, origin: 0, centres: [] as number[], imgs: [] as HTMLElement[] });

  const section = useSectionScroll<HTMLElement>(
    (p) => {
      const t = track.current;
      const L = layout.current;
      if (!t || !L.wide) return;
      // Left-to-right languages walk the strip leftwards; Arabic walks it rightwards.
      const x = L.sign * p * L.distance;
      t.style.transform = `translate3d(${x}px, 0, 0)`;
      // Each photo drifts inside its frame by where that frame sits on screen.
      const vw = window.innerWidth;
      for (let k = 0; k < L.imgs.length; k++) {
        const centre = (L.origin + L.centres[k] + x) / vw - 0.5;
        L.imgs[k].style.transform = `translate3d(${centre * -12}%, 0, 0) scale(1.25)`;
      }
    },
    () => {
      const t = track.current;
      if (!t) return;
      const L = layout.current;
      L.wide = matchMedia("(min-width: 768px)").matches;
      if (!L.wide) {
        t.style.transform = "";
        return;
      }
      // Measure with the strip at rest so the positions are its own, not the scrolled ones.
      const prev = t.style.transform;
      t.style.transform = "";
      L.distance = t.scrollWidth - window.innerWidth;
      L.sign = getComputedStyle(t).direction === "rtl" ? 1 : -1;
      const base = t.getBoundingClientRect().left;
      L.origin = base;
      L.imgs = [...t.querySelectorAll<HTMLElement>("[data-drift]")];
      L.centres = L.imgs.map((img) => {
        const r = img.parentElement!.getBoundingClientRect();
        return r.left - base + r.width / 2;
      });
      t.style.transform = prev;
    },
  );

  return (
    <section ref={section} className="relative bg-blush md:h-[320svh]" aria-label={t.lookbook.label}>
      <div className="overflow-x-auto md:sticky md:top-0 md:h-svh md:overflow-hidden">
        <div
          ref={track}
          className="flex h-full w-max items-center gap-6 px-5 py-20 will-change-transform md:gap-10 md:px-16 md:py-0"
        >
          <div className="flex w-[78vw] shrink-0 flex-col justify-center md:w-[34vw] md:pe-10">
            <p className="text-sm text-ink/60">{t.lookbook.label}</p>
            <h2 className="display mt-4 text-[clamp(2.8rem,6vw,5.5rem)]">
              {t.lookbook.title1}
              <br />
              {t.lookbook.title2}
            </h2>
            <p className="mt-6 max-w-[30ch] text-ink/70">
              {t.lookbook.body}
            </p>
          </div>

          {FRAMES.map((f) => {
            const body = (
              <>
                <div className={`relative overflow-hidden rounded-[15px] bg-blush-4 ${SIZE[f.size]}`}>
                  <Image
                    data-drift
                    src={f.photo.src}
                    alt={i.alt(f.photo)}
                    fill
                    sizes="(min-width: 768px) 45vw, 85vw"
                    className="scale-125 object-cover will-change-transform"
                  />
                </div>
                <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm text-ink">
                  {t.lookbook.captions[f.caption]}
                  {f.href && <span className="shrink-0 text-ink/40 transition-colors group-hover:text-ember">{t.common.shopArrow}</span>}
                </figcaption>
              </>
            );
            return (
              <figure key={f.caption} className={`shrink-0 ${f.size === "small" ? "self-end md:mb-[14svh]" : ""}`}>
                {f.href ? (
                  <Link href={f.href} data-cursor={t.lookbook.cursor} className="group block">
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
