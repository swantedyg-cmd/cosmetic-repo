"use client";

import { useMemo, useState } from "react";
import Link from "@/i18n/Link";
import { ingredients as base, JOBS, type Job } from "@/data/ingredients";
import { useI18n } from "@/i18n/client";
import { activeName, initial } from "@/i18n/localize";

// Every active, A–Z (or ا–ي), with our percentage marked against the range it's usually used at.
export default function IngredientIndex() {
  const i = useI18n();
  const { t, locale } = i;
  const [query, setQuery] = useState("");
  const [job, setJob] = useState<Job | "All">("All");
  const letters = [...t.ingredients.alphabet];

  // Names, notes and product names in the page's language, sorted the way that language sorts.
  const ingredients = useMemo(() => {
    const collator = new Intl.Collator(locale);
    return base
      .map((ing) => ({
        ...ing,
        name: activeName(ing.name, t),
        does: t.catalog.does[ing.name] ?? ing.does,
        product: { slug: ing.product.slug, name: i.bySlug(ing.product.slug)?.name ?? ing.product.name },
      }))
      .sort((a, b) => collator.compare(a.name, b.name));
  }, [i, t, locale]);

  const q = query.trim().toLocaleLowerCase(locale);
  const shown = ingredients.filter(
    (ing) =>
      (job === "All" || ing.job === job) &&
      (!q || `${ing.name} ${ing.does} ${ing.product.name}`.toLocaleLowerCase(locale).includes(q)),
  );
  const present = new Set(shown.map((ing) => initial(ing.name, locale)));
  const example = i.bySlug("dew-serum")!.name;

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-mist pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.ingredients.filter}>
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
              {j === "All" ? t.common.all : t.catalog.jobs[j]}
            </button>
          ))}
        </div>
        <label className="relative md:w-72">
          <span className="sr-only">{t.ingredients.search}</span>
          <input
            type="search"
            name="ingredient"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.ingredients.search}
            className="w-full rounded-full border-[1.5px] border-mist px-5 py-2.5 text-sm outline-none transition-colors focus:border-ember"
          />
        </label>
      </div>

      {/* Letter rail: letters with no ingredient stay faint. */}
      <nav aria-label={t.ingredients.jump} className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {letters.map((l) =>
          present.has(l) ? (
            <a key={l} href={`#letter-${l}`} className="text-ink hover:text-ember">
              {l}
            </a>
          ) : (
            <span key={l} className="text-mist">
              {l}
            </span>
          ),
        )}
      </nav>

      {shown.length === 0 ? (
        <p className="mt-16 text-smoke">{i.fmt(t.ingredients.none, { query, example })}</p>
      ) : (
        <ul className="mt-8 border-t border-mist">
          {shown.map((ing, idx) => {
            const letter = initial(ing.name, locale);
            const first = idx === 0 || initial(shown[idx - 1].name, locale) !== letter;
            return (
              <li
                key={`${ing.name}-${ing.product.slug}`}
                id={first ? `letter-${letter}` : undefined}
                className="ingredient-row grid scroll-mt-32 gap-4 border-b border-mist py-7 md:grid-cols-[14rem_1fr_18rem] md:items-center md:gap-10"
                style={{ animationDelay: `${Math.min(idx, 10) * 50}ms` }}
              >
                <div>
                  <h2 className="text-[23px] font-light tracking-[-0.03em] text-ink">{ing.name}</h2>
                  <p className="mt-1 text-xs text-smoke">{t.catalog.jobs[ing.job]}</p>
                </div>
                <div>
                  <p className="text-graphite/85">{ing.does}</p>
                  <Link
                    href={`/shop/${ing.product.slug}`}
                    className="mt-2 inline-block text-sm underline decoration-apricot decoration-[1.5px] underline-offset-[5px] hover:text-ember"
                  >
                    {i.fmt(t.ingredients.inProduct, { name: ing.product.name })}
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

/** Our concentration (dot) against the range it's typically used at (band). Runs from the reading start. */
function RangeBar({ percent, range }: { percent: number; range?: [number, number] }) {
  const { t, fmt, num } = useI18n();
  const max = Math.max(percent, range?.[1] ?? percent) * 1.1;
  const at = (n: number) => `${(n / max) * 100}%`;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[32px] font-extralight leading-none tracking-[-0.05em] text-ink tabular-nums">{num(percent)}%</span>
        {range && <span className="text-xs text-smoke">{fmt(t.ingredients.usually, { min: num(range[0]), max: num(range[1]) })}</span>}
      </div>
      <div className="relative mt-3 h-[14px]">
        <span className="absolute inset-x-0 top-1/2 h-px bg-mist" />
        {range && (
          <span
            className="absolute top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-apricot/35"
            style={{ insetInlineStart: at(range[0]), width: `calc(${at(range[1])} - ${at(range[0])})` }}
          />
        )}
        <span
          className="range-dot absolute top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-canvas bg-ember shadow-[0_0_0_1px_var(--ember)] rtl:translate-x-1/2"
          style={{ insetInlineStart: at(percent) }}
        />
      </div>
    </div>
  );
}
