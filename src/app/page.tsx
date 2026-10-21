import Link from "next/link";
import HomeHero from "@/components/HomeHero";
import Newsletter from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";
import { DropIcon, LeafIcon, RabbitIcon, RecycleIcon } from "@/components/icons";
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
      <HomeHero />

      {/* Featured formulas */}
      <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)]">The formulas</h2>
          <Link href="/shop" className="text-sm underline decoration-apricot decoration-[1.5px] underline-offset-[6px] hover:text-ember">
            Shop all {products.length}
          </Link>
        </div>
        <div className="mt-10 grid gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Stat callout + trust row */}
      <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10">
        <div className="grid items-end gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="display text-[clamp(6rem,17vw,9.5rem)] !leading-[0.9] !tracking-[-0.091em] !text-graphite">
              {brandStat.value}
            </p>
            <p className="mt-3 max-w-[22ch] text-sm text-smoke">{brandStat.label}</p>
          </div>
          <p className="max-w-sm text-[20px] font-light leading-[1.3] tracking-[-0.03em] text-ink">
            The other 2% keeps each formula stable and safe — and it’s on the label too.
          </p>
        </div>
        <ul className="mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-mist pt-8">
          {TRUST.map(({ icon: I, label }) => (
            <li key={label} className="flex items-center gap-[10px] text-sm">
              <I />
              {label}
            </li>
          ))}
        </ul>
      </section>

      {/* Every active, at its real concentration */}
      <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)] text-balance">
              Every active, at the percentage we put in
            </h2>
            <p className="mt-6 max-w-sm text-smoke">
              No “infused with” and no proprietary blends. If it does the work, its share of the formula is printed here.
            </p>
          </div>
          <div className="divide-y divide-mist border-y border-mist">
            {products.map((p) => (
              <Link
                key={p.slug}
                href={`/shop/${p.slug}`}
                className="group grid gap-3 py-5 md:grid-cols-[11rem_1fr] md:gap-8"
              >
                <span className="font-medium text-ink group-hover:text-ember">{p.name}</span>
                <ul className="space-y-2">
                  {p.actives.map((a) => (
                    <li key={a.name} className="grid grid-cols-[3rem_1fr_8rem] items-center gap-3 text-sm">
                      <span className="tabular-nums">{a.percent}%</span>
                      <span className="relative h-px bg-mist">
                        <span
                          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-ember"
                          style={{ width: `${(a.percent / MAX_PERCENT) * 100}%` }}
                        />
                      </span>
                      <span className="text-smoke">{a.name}</span>
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Order of application */}
      <section className="bg-ink text-canvas">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-10">
          <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)] !text-canvas">Thinnest first, richest last</h2>
          <div className="mt-14 grid gap-12 md:grid-cols-2">
            {RITUAL.map((r) => (
              <div key={r.time}>
                <p className="text-sm text-apricot">{r.time}</p>
                <ol className="mt-5">
                  {r.steps.map((slug, i) => {
                    const p = getProduct(slug)!;
                    return (
                      <li key={slug} className="flex items-baseline gap-6 border-b border-canvas/15 py-4">
                        <span className="text-xs text-canvas/50">Step {i + 1}</span>
                        <Link href={`/shop/${slug}`} className="text-[23px] font-extralight tracking-[-0.03em] hover:text-apricot">
                          {p.name}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
