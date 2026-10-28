import Link from "next/link";
import Reveal from "./Reveal";
import { formatPrice, getProduct } from "@/data/products";

// Keep the jar, buy the refill. Savings are worked out from the real catalogue prices.
const jar = getProduct("veil-barrier-cream")!;
const full = jar.variants.find((v) => v.id !== "refill")!.price;
const refill = jar.variants.find((v) => v.id === "refill")!.price;
const REFILLS_A_YEAR = 6;

const STEPS = [
  { title: "Buy the jar once", body: `${jar.name} in heavy glass, ${formatPrice(full)}.` },
  { title: "Refill when it’s empty", body: `The cream comes in a recyclable pod that drops into the jar, ${formatPrice(refill)}.` },
  { title: "Send old pods back", body: "Free return label in every refill box. We clean and reuse what we can." },
];

export default function Refill() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10">
      <div className="grid items-center gap-12 rounded-[15px] bg-[#fbe9dc] p-6 md:grid-cols-[1fr_1.1fr] md:gap-16 md:p-14">
        {/* A pod drops into the jar and the level rises, on a slow loop. */}
        <Reveal className="relative mx-auto aspect-square w-full max-w-[380px]" >
          <div className="refill-scene" aria-hidden>
            <span className="refill-pod" />
            <span className="refill-lid" />
            <span className="refill-jar">
              <span className="refill-level" />
            </span>
            <span className="refill-shadow" />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-sm text-ink/60">Refill programme</p>
            <h2 className="display mt-3 text-[clamp(2.2rem,4.4vw,3.25rem)]">Keep the glass</h2>
            <p className="mt-6 flex items-baseline gap-3">
              <span className="text-[64px] font-extralight leading-none tracking-[-0.06em] text-ember tabular-nums">
                {formatPrice((full - refill) * REFILLS_A_YEAR)}
              </span>
              <span className="max-w-[18ch] text-sm text-ink/60">saved over a year of {REFILLS_A_YEAR} refills</span>
            </p>
          </Reveal>
          <ol className="mt-10 border-t border-ink/15">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <Reveal delay={i * 110} className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-ink/15 py-5">
                  <span className="text-xs text-ink/60">Step {i + 1}</span>
                  <span>
                    <span className="block text-[19px] font-light tracking-[-0.03em] text-ink">{s.title}</span>
                    <span className="mt-1 block text-sm text-ink/70">{s.body}</span>
                  </span>
                </Reveal>
              </li>
            ))}
          </ol>
          <Link href={`/shop/${jar.slug}`} className="btn mt-8">Shop the refill</Link>
        </div>
      </div>
    </section>
  );
}
