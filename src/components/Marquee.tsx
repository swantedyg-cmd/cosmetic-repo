import Image from "next/image";
import { productPhotos } from "@/data/photos";
import { products } from "@/data/products";

// The full ingredient list, running past like a ticker, with each product's
// texture set into the line as a small round swatch.
export default function Marquee() {
  const items = products.flatMap((p) =>
    p.actives.map((a, i) => ({ key: `${p.slug}-${a.name}`, text: `${a.name} ${a.percent}%`, photo: i === 0 ? productPhotos[p.slug][1] : null })),
  );
  const run = (copy: number) =>
    items.map((it) => (
      <span key={`${copy}-${it.key}`} className="flex shrink-0 items-center gap-6 pr-6 md:gap-10 md:pr-10">
        {it.photo ? (
          <span className="relative block h-[0.8em] w-[0.8em] overflow-hidden rounded-full">
            <Image src={it.photo.src} alt="" fill sizes="96px" className="object-cover" />
          </span>
        ) : (
          <span className="block h-2 w-2 rounded-full bg-ember" />
        )}
        <span className="whitespace-nowrap">{it.text}</span>
      </span>
    ));

  return (
    <section aria-label="Every active in the range" className="overflow-hidden border-y border-mist py-6 md:py-8">
      <div className="marquee text-[clamp(2.4rem,6vw,5rem)] font-extralight leading-none tracking-[-0.06em] text-ink">
        {run(0)}
        <span aria-hidden className="contents">{run(1)}</span>
      </div>
    </section>
  );
}
