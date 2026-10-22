import Image from "next/image";
import Link from "next/link";
import FormulaTour from "@/components/FormulaTour";
import Hero from "@/components/Hero";
import Lookbook from "@/components/Lookbook";
import Marquee from "@/components/Marquee";
import Newsletter from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import TextureStudy from "@/components/TextureStudy";
import { DropIcon, LeafIcon, RabbitIcon, RecycleIcon } from "@/components/icons";
import { editorial } from "@/data/photos";
import { brandStat, featured, getProduct, products } from "@/data/products";

const MAX_PERCENT = Math.max(...products.flatMap((p) => p.actives.map((a) => a.percent)));

const TRUST = [
  { icon: LeafIcon, label: "Plant-derived actives" },
  { icon: RabbitIcon, label: "Cruelty-free" },
  { icon: DropIcon, label: "Fragrance-free" },
  { icon: RecycleIcon, label: "Refillable glass" },
];

const RITUAL = [
  { time: "Morning", steps: ["dew-serum", "veil-barrier-cream"] },
  { time: "Evening", steps: ["dew-serum", "ember-facial-oil", "veil-barrier-cream"] },
];

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />

      {/* Featured formulas */}
      <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10">
        <Reveal className="flex items-end justify-between gap-6">
          <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)]">The formulas</h2>
          <Link href="/shop" className="text-sm underline decoration-apricot decoration-[1.5px] underline-offset-[6px] hover:text-ember">
            Shop all {products.length}
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 120}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stat callout beside an unlabelled bottle: what's inside matters more than the label. */}
      <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10">
        <div className="grid items-end gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <Reveal>
              <p className="display text-[clamp(6rem,17vw,11rem)] !leading-[0.85] !tracking-[-0.091em] !text-graphite">
                {brandStat.value}
              </p>
              <p className="mt-4 max-w-[24ch] text-sm text-smoke">{brandStat.label}</p>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-12 max-w-sm text-[22px] font-light leading-[1.3] tracking-[-0.03em] text-ink">
                The other 2% keeps each formula stable and safe — and it’s on the label too.
              </p>
            </Reveal>
            <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-mist pt-8">
              {TRUST.map(({ icon: I, label }, i) => (
                <li key={label}>
                  <Reveal delay={i * 90} className="flex items-center gap-[10px] text-sm">
                    <I />
                    {label}
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
          <Reveal variant="clip" className="relative aspect-[4/5] overflow-hidden rounded-[15px]">
            <Image src={editorial.amber.src} alt={editorial.amber.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </Reveal>
        </div>
      </section>

      <FormulaTour />
      <Lookbook />
      <TextureStudy />

      {/* Every active, at its real concentration */}
      <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)] text-balance">
              Every active, at the percentage we put in
            </h2>
            <p className="mt-6 max-w-sm text-smoke">
              No “infused with” and no proprietary blends. If it does the work, its share of the formula is printed here.
            </p>
          </Reveal>
          <div className="divide-y divide-mist border-y border-mist">
            {products.map((p, i) => (
              <Reveal key={p.slug} delay={i * 100}>
                <Link href={`/shop/${p.slug}`} className="group grid gap-3 py-5 md:grid-cols-[11rem_1fr] md:gap-8">
                  <span className="font-medium text-ink transition-colors group-hover:text-ember">{p.name}</span>
                  <ul className="space-y-2">
                    {p.actives.map((a) => (
                      <li key={a.name} className="grid grid-cols-[3rem_1fr_8rem] items-center gap-3 text-sm">
                        <span className="tabular-nums">{a.percent}%</span>
                        <span className="relative h-px bg-mist">
                          <span
                            className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-ember transition-[width] duration-700 group-hover:bg-tangerine"
                            style={{ width: `${(a.percent / MAX_PERCENT) * 100}%` }}
                          />
                        </span>
                        <span className="text-smoke">{a.name}</span>
                      </li>
                    ))}
                  </ul>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Order of application */}
      <section className="bg-ink text-canvas">
        <div className="mx-auto grid max-w-[1280px] gap-14 px-5 py-24 md:grid-cols-[0.8fr_1fr_1fr] md:gap-12 md:px-10">
          <Reveal variant="clip" className="relative aspect-[3/4] overflow-hidden rounded-[15px] md:row-span-2 md:aspect-auto">
            <Image src={editorial.applying.src} alt={editorial.applying.alt} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal className="md:col-span-2">
            <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)] !text-canvas">Thinnest first, richest last</h2>
            <p className="mt-5 max-w-[40ch] text-canvas/60">
              Layer by texture so each step can reach skin before the next one seals it in.
            </p>
          </Reveal>
          {RITUAL.map((r, ri) => (
            <Reveal key={r.time} delay={ri * 150}>
              <p className="text-sm text-apricot">{r.time}</p>
              <ol className="mt-5">
                {r.steps.map((slug, i) => {
                  const p = getProduct(slug)!;
                  return (
                    <li key={slug} className="flex items-baseline gap-6 border-b border-canvas/15 py-4">
                      <span className="text-xs text-canvas/50">Step {i + 1}</span>
                      <Link href={`/shop/${slug}`} className="text-[23px] font-extralight tracking-[-0.03em] transition-colors hover:text-apricot">
                        {p.name}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </Reveal>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
