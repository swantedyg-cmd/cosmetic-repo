"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { CATEGORIES, products, ritualOf, type Category, type Ritual } from "@/data/products";
import { useTheme } from "@/lib/theme";

type Sort = "routine" | "price-asc" | "price-desc";

const SORTS: { id: Sort; label: string }[] = [
  { id: "routine", label: "Routine order" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
];

const from = (slug: string) => products.find((p) => p.slug === slug)!.variants[0].price;

/** The full range, filterable by routine step and sortable by price. */
export default function ShopGrid() {
  const [category, setCategory] = useState<Category | "All">("All");
  const [sort, setSort] = useState<Sort>("routine");
  const [ritual, setRitual] = useState<Ritual | "Any">("Any");
  const night = useTheme() === "night";
  // At night the evening formulas come forward first; by day, the morning ones.
  const lead: Ritual = night ? "PM" : "AM";
  const leads = (slug: string) => (ritualOf(slug).includes(lead) ? 0 : 1);

  const shown = products
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => ritual === "Any" || ritualOf(p.slug).includes(ritual))
    .sort((a, b) => {
      if (sort === "price-asc") return from(a.slug) - from(b.slug);
      if (sort === "price-desc") return from(b.slug) - from(a.slug);
      return leads(a.slug) - leads(b.slug) || CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category);
    });

  return (
    <>
      <div className="mt-12 flex flex-col gap-4 border-b border-mist pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by step">
          {(["All", ...CATEGORIES] as const).map((c) => {
            const count = c === "All" ? products.length : products.filter((p) => p.category === c).length;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  category === c ? "border-ink bg-ink text-canvas" : "border-ink/20 hover:border-ink"
                }`}
              >
                {c} <span className={`tabular-nums ${category === c ? "text-canvas/60" : "text-smoke"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-5">
        <div className="flex rounded-full border border-ink/20 p-1 text-sm" role="group" aria-label="Filter by ritual">
          {([["Any", "Any time"], ["AM", "Morning"], ["PM", "Evening"]] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={ritual === id}
              onClick={() => setRitual(id)}
              className={`rounded-full px-3.5 py-1.5 transition-colors ${ritual === id ? "bg-ink text-canvas" : "text-smoke hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm text-smoke">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-ink/20 bg-canvas px-4 py-2 text-ink hover:border-ink"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        </div>
      </div>

      {/* Keyed on the filter so the new set fades up together. */}
      <ul key={`${category}-${sort}-${ritual}-${lead}`} className="mt-10 grid gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <li key={p.slug} className="shop-item" style={{ animationDelay: `${i * 60}ms` }}>
            <ProductCard product={p} priority={i < 3} />
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="mt-10 text-smoke">Nothing in this step for that ritual. Try “Any time”.</p>
      )}
    </>
  );
}
