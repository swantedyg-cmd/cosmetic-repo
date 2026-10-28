"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import { getProduct } from "@/data/products";
import { reviews as all, SKIN_TYPES, type SkinType } from "@/data/reviews";

// Reviews you can read by skin type: the only filter that changes whether a review applies to you.
export default function Reviews({ product, title = "Read by skin type" }: { product?: string; title?: string }) {
  const [skin, setSkin] = useState<SkinType | "All">("All");
  const pool = product ? all.filter((r) => r.product === product) : all;
  const shown = skin === "All" ? pool : pool.filter((r) => r.skin === skin);
  const average = pool.reduce((n, r) => n + r.rating, 0) / Math.max(1, pool.length);
  const counts = [5, 4, 3, 2, 1].map((star) => ({ star, n: pool.filter((r) => r.rating === star).length }));

  if (pool.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10" aria-labelledby="reviews-title">
      <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-16">
        <Reveal>
          <h2 id="reviews-title" className="display text-[clamp(2.2rem,4.4vw,3.25rem)]">{title}</h2>
          <p className="mt-8 flex items-baseline gap-3">
            <span className="text-[64px] font-extralight leading-none tracking-[-0.06em] text-ink tabular-nums">{average.toFixed(1)}</span>
            <span className="text-sm text-smoke">out of 5 · {pool.length} reviews</span>
          </p>
          <ul className="mt-6 max-w-xs space-y-2">
            {counts.map(({ star, n }) => (
              <li key={star} className="grid grid-cols-[1.5rem_1fr_1.5rem] items-center gap-3 text-xs text-smoke">
                <span>{star}★</span>
                <span className="h-px bg-mist">
                  <span className="block h-[2px] -translate-y-[0.5px] bg-ember" style={{ width: `${(n / pool.length) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by skin type">
            {(["All", ...SKIN_TYPES] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={skin === s}
                onClick={() => setSkin(s)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  skin === s ? "border-ink bg-ink text-canvas" : "border-ink/20 hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="mt-10 text-smoke">No reviews from {skin.toLowerCase()} skin yet. Try another skin type.</p>
          ) : (
            <ul key={skin} className="mt-8 grid gap-[10px] sm:grid-cols-2">
              {shown.map((r, i) => (
                <li
                  key={r.id}
                  className="review-card flex flex-col rounded-[10px] border-[1.5px] border-mist p-6"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <Stars rating={r.rating} />
                  <h3 className="mt-4 text-[19px] font-light tracking-[-0.03em]">{r.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite/80">{r.body}</p>
                  <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-mist pt-4 text-xs text-smoke">
                    <span className="text-ink">{r.author}</span>
                    <span>{r.skin} skin</span>
                    <span>Used {r.weeks} weeks</span>
                    {!product && (
                      <Link href={`/shop/${r.product}`} className="ml-auto text-ink hover:text-ember">
                        {getProduct(r.product)?.name}
                      </Link>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="13" height="13" viewBox="0 0 24 24" className={n <= rating ? "fill-ember" : "fill-mist"} aria-hidden>
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}
