"use client";

import { useState } from "react";
import Link from "next/link";
import { ingredients, JOBS, type Job } from "@/data/ingredients";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Every active, A–Z, with our percentage marked against the range it's usually used at.
export default function IngredientIndex() {
  const [query, setQuery] = useState("");
  const [job, setJob] = useState<Job | "All">("All");
  const q = query.trim().toLowerCase();
  const shown = ingredients.filter(
    (i) => (job === "All" || i.job === job) && (!q || `${i.name} ${i.does} ${i.product.name}`.toLowerCase().includes(q)),
  );
  const present = new Set(shown.map((i) => i.name[0].toUpperCase()));

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-mist pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by what it does">
          {(["All", ...JOBS] as const).map((j) => (
            <button
              key={j}
              type="button"
              aria-pressed={job === j}
              onClick={() => setJob(j)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                job === j ? "border-ink bg-ink text-canvas" : "border-ink/20 hover:border-ink"
              }`}
            >
              {j}
            </button>
          ))}
        </div>
        <label className="relative md:w-72">
          <span className="sr-only">Search ingredients</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ingredients"
            className="w-full rounded-full border-[1.5px] border-mist px-5 py-2.5 text-sm outline-none transition-colors focus:border-ember"
          />
        </label>
      </div>

      {/* Letter rail: letters with no ingredient stay faint. */}
      <nav aria-label="Jump to letter" className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {LETTERS.map((l) =>
          present.has(l) ? (
            <a key={l} href={`#letter-${l}`} className="text-ink hover:text-ember">{l}</a>
          ) : (
            <span key={l} className="text-mist">{l}</span>
          ),
        )}
      </nav>

      {shown.length === 0 ? (
        <p className="mt-16 text-smoke">Nothing matches “{query}”. Try a product name, like Dew Serum.</p>
      ) : (
        <ul className="mt-8 border-t border-mist">
          {shown.map((ing, idx) => {
            const letter = ing.name[0].toUpperCase();
            const first = idx === 0 || shown[idx - 1].name[0].toUpperCase() !== letter;
            return (
              <li
                key={`${ing.name}-${ing.product.slug}`}
                id={first ? `letter-${letter}` : undefined}
                className="ingredient-row grid scroll-mt-32 gap-4 border-b border-mist py-7 md:grid-cols-[14rem_1fr_18rem] md:items-center md:gap-10"
                style={{ animationDelay: `${Math.min(idx, 10) * 50}ms` }}
              >
                <div>
                  <h2 className="text-[23px] font-light tracking-[-0.03em] text-ink">{ing.name}</h2>
                  <p className="mt-1 text-xs text-smoke">{ing.job}</p>
                </div>
                <div>
                  <p className="text-graphite/85">{ing.does}</p>
                  <Link href={`/shop/${ing.product.slug}`} className="mt-2 inline-block text-sm underline decoration-apricot decoration-[1.5px] underline-offset-[5px] hover:text-ember">
                    In {ing.product.name}
                  </Link>
                </div>
                <RangeBar percent={ing.percent} range={ing.range} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Our concentration (dot) against the range it's typically used at (band). */
function RangeBar({ percent, range }: { percent: number; range?: [number, number] }) {
  const max = Math.max(percent, range?.[1] ?? percent) * 1.1;
  const at = (n: number) => `${(n / max) * 100}%`;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[32px] font-extralight leading-none tracking-[-0.05em] text-ink tabular-nums">{percent}%</span>
        {range && <span className="text-xs text-smoke">usually {range[0]}–{range[1]}%</span>}
      </div>
      <div className="relative mt-3 h-[14px]">
        <span className="absolute inset-x-0 top-1/2 h-px bg-mist" />
        {range && (
          <span
            className="absolute top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-apricot/35"
            style={{ left: at(range[0]), width: `calc(${at(range[1])} - ${at(range[0])})` }}
          />
        )}
        <span
          className="range-dot absolute top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-canvas bg-ember shadow-[0_0_0_1px_var(--ember)]"
          style={{ left: at(percent) }}
        />
      </div>
    </div>
  );
}
