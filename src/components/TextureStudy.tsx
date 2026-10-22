"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { productPhotos } from "@/data/photos";
import { products } from "@/data/products";

// Placeholder texture notes — confirm with the client's lab sheets.
const FEEL: Record<string, { word: string; note: string }> = {
  "ember-facial-oil": { word: "Dry-touch", note: "Spreads thin, sinks in within a minute, leaves a low sheen rather than a slick." },
  "dew-serum": { word: "Water-light", note: "Clear gel that breaks into water on contact. Nothing left to rub in." },
  "veil-barrier-cream": { word: "Cushion", note: "Dense in the jar, soft on skin. Melts at body heat into a flexible veil." },
  "tint-balm": { word: "Melt", note: "Glides on like balm, sets to a sheer wash you can build in two taps." },
};

// A sticky frame of texture close-ups that changes as each note scrolls past —
// the closest a screen gets to swatching on the back of your hand.
export default function TextureStudy() {
  const [active, setActive] = useState(0);
  const notes = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    notes.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="md:sticky md:top-24 md:h-[calc(100svh-8rem)]">
          <div className="relative hidden h-full overflow-hidden rounded-[15px] bg-mist md:block">
            {products.map((p, i) => (
              <Image
                key={p.slug}
                src={productPhotos[p.slug][1].src}
                alt={productPhotos[p.slug][1].alt}
                fill
                sizes="50vw"
                className={`object-cover transition-all duration-[1.2s] ease-[cubic-bezier(0.77,0,0.18,1)] ${
                  i === active ? "scale-100 [clip-path:inset(0_0_0_0)]" : i < active ? "scale-105 [clip-path:inset(0_0_100%_0)]" : "scale-105 [clip-path:inset(100%_0_0_0)]"
                }`}
              />
            ))}
            <span className="absolute bottom-5 left-5 rounded-full bg-canvas/90 px-4 py-2 text-sm text-ink backdrop-blur-sm">
              {products[active].name}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-smoke">Texture</p>
          <h2 className="display mt-4 max-w-[12ch] text-[clamp(2.4rem,5vw,4rem)]">How each one feels on skin</h2>
          <ol className="mt-10 md:mt-[20svh]">
            {products.map((p, i) => (
              <li
                key={p.slug}
                ref={(el) => {
                  notes.current[i] = el;
                }}
                data-index={i}
                className={`border-t border-mist py-10 transition-opacity duration-700 md:min-h-[55svh] ${
                  i === active ? "md:opacity-100" : "md:opacity-30"
                }`}
              >
                <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[15px] md:hidden">
                  <Image src={productPhotos[p.slug][1].src} alt={productPhotos[p.slug][1].alt} fill sizes="100vw" className="object-cover" />
                </div>
                <p className="text-sm text-smoke">{p.name}</p>
                <p className="mt-3 text-[clamp(3rem,7vw,5.5rem)] font-extralight leading-none tracking-[-0.07em] text-ink">
                  {FEEL[p.slug].word}
                </p>
                <p className="mt-5 max-w-[36ch] text-ink/70">{FEEL[p.slug].note}</p>
                <Link
                  href={`/shop/${p.slug}`}
                  className="mt-6 inline-block text-sm underline decoration-apricot decoration-[1.5px] underline-offset-[6px] hover:text-ember"
                >
                  See {p.name}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
