import Image from "next/image";
import { productPhotos } from "@/data/photos";
import { products } from "@/data/products";

// The full ingredient list as a ticker, grouped by product: a texture swatch and the
// product name, then each active as a figure with its name beneath. Every cell rides
// a slow 3D swell; the phase steps along the line so a wave rolls through it.

/** Seconds for one cell to rise and fall. */
const SWELL = 6;
/** Whole waves across one copy of the line. */
const WAVES = 3;

export default function Marquee() {
  const cells = products.flatMap((p) => [
    { key: p.slug, kind: "product" as const, product: p },
    ...p.actives.map((a) => ({ key: `${p.slug}-${a.name}`, kind: "active" as const, active: a })),
  ]);
  // Both copies share phases, so the jump back to the start of the loop is invisible.
  const delay = (i: number) => ({ "--d": `${(-i * WAVES * SWELL) / cells.length}s` }) as React.CSSProperties;

  const run = (copy: number) =>
    cells.map((c, i) =>
      c.kind === "product" ? (
        <span key={`${copy}-${c.key}`} className="wave-cell flex shrink-0 items-center gap-3 pl-6 pr-8 md:pl-10 md:pr-12" style={delay(i)}>
          <span className="relative block h-11 w-11 overflow-hidden rounded-full ring-1 ring-apricot/60 ring-offset-2 ring-offset-canvas md:h-12 md:w-12">
            <Image src={productPhotos[c.product.slug][1].src} alt="" fill sizes="48px" className="object-cover" />
          </span>
          <span className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.14em] text-smoke">{c.product.name}</span>
        </span>
      ) : (
        <span key={`${copy}-${c.key}`} className="wave-cell flex shrink-0 flex-col px-5 md:px-7" style={delay(i)}>
          <span className="wave-figure text-[clamp(1.9rem,3.4vw,2.75rem)] font-extralight leading-none tracking-[-0.06em] tabular-nums">
            {c.active.percent}
            <span className="text-[0.5em] align-top">%</span>
          </span>
          <span className="mt-2 whitespace-nowrap text-xs text-smoke">{c.active.name}</span>
        </span>
      ),
    );

  return (
    <section aria-label="Every active in the range" className="wave-band overflow-hidden border-y border-mist py-9 md:py-11">
      <div className="marquee items-center">
        {run(0)}
        <span aria-hidden className="contents">{run(1)}</span>
      </div>
    </section>
  );
}
