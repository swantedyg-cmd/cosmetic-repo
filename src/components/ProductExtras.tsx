import Link from "next/link";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import Reviews from "./Reviews";
import { products, type Product } from "@/data/products";

// Placeholder policies — confirm shipping, returns and patch-test wording with the client.
const GENERAL_FAQ = [
  { q: "How long does shipping take?", a: "2–4 working days in the EU. Free over €60, and every order includes a sample." },
  { q: "Can I return it if it doesn’t suit me?", a: "Yes, within 30 days, even if it’s opened. Email us and we’ll send a return label." },
  { q: "Should I patch test?", a: "If your skin reacts easily, try a little behind the ear or on the inner arm for two evenings first." },
  { q: "Is it cruelty-free and vegan?", a: "Both. No animal testing at any stage, and no animal-derived ingredients in any formula." },
];

export default function ProductExtras({ product }: { product: Product }) {
  const pairs = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  const faq = [{ q: `How do I use ${product.name}?`, a: product.howToUse }, ...GENERAL_FAQ];

  return (
    <>
      <Reviews product={product.slug} title={`What people say about ${product.name}`} />

      <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10">
        <Reveal className="flex items-end justify-between gap-6">
          <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)]">Layers well with</h2>
          <Link href="/routine" className="text-sm underline decoration-apricot decoration-[1.5px] underline-offset-[6px] hover:text-ember">
            Build your routine
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {pairs.map((p, i) => (
            <Reveal key={p.slug} delay={i * 120}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
          <Reveal>
            <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)]">Questions</h2>
            <p className="mt-5 max-w-xs text-smoke">
              Something else? <Link href="/contact" className="text-ink underline underline-offset-4 hover:text-ember">Ask us</Link> and a real person replies within a day.
            </p>
          </Reveal>
          <div className="border-t border-mist">
            {faq.map((f) => (
              <details key={f.q} className="faq group border-b border-mist">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[19px] font-light tracking-[-0.03em] text-ink">
                  {f.q}
                  <span aria-hidden className="faq-icon relative h-3 w-3 shrink-0" />
                </summary>
                <p className="max-w-[60ch] pb-6 text-smoke">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
