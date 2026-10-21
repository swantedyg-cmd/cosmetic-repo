import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

// Placeholder story — replace with the client's own once they send it.
const PRINCIPLES = [
  {
    title: "Clear glass",
    body: "You should see how much is left and what colour it is. Glass also keeps oils and vitamins stable longer than plastic.",
  },
  {
    title: "Printed percentages",
    body: "Every active is listed with its exact concentration, so you can compare us with anyone.",
  },
  {
    title: "Fewer, better products",
    body: "Four formulas that layer together, instead of forty that compete for the same job.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-12">
      <p className="label text-smoke">About Solenne</p>
      <h1 className="mt-4 max-w-3xl display text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.05] ">
        We started with the label, then wrote the formulas to match it
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-smoke">
        Solenne began as a frustration with skincare that hides what’s inside. So we made it simple: clear bottles,
        short ingredient lists, and the real percentage of every active on the front.
      </p>

      <div className="mt-20 grid gap-10 border-t border-mist pt-12 md:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <div key={p.title}>
            <h2 className="text-[23px] font-light tracking-[-0.03em]">{p.title}</h2>
            <p className="mt-3 leading-relaxed text-smoke">{p.body}</p>
          </div>
        ))}
      </div>

      <Link href="/shop" className="mt-16 inline-block btn">
        See the formulas
      </Link>
    </div>
  );
}
