import { CATEGORIES, getProduct, products, ritualOf, type Product, type Ritual } from "@/data/products";

// "Complete your ritual": a routine needs a cleanse, a treatment and a moisturiser.
// Given what someone already has, suggest one product for each step they're missing,
// preferring formulas for the same time of day as what they chose.

const STEPS = CATEGORIES.filter((c) => c !== "Colour");

export function completeRitual(slugs: string[], limit = 3): Product[] {
  const have = slugs.map(getProduct).filter((p): p is Product => !!p);
  if (have.length === 0) return [];
  const owned = new Set(have.map((p) => p.slug));
  const steps = new Set(have.map((p) => p.category));
  const votes = { AM: 0, PM: 0 } as Record<Ritual, number>;
  have.forEach((p) => ritualOf(p.slug).forEach((r) => votes[r]++));
  const time: Ritual = votes.PM > votes.AM ? "PM" : "AM";

  const fits = (p: Product) => (ritualOf(p.slug).includes(time) ? 0 : 1);
  const pick = (pool: Product[]) => pool.filter((p) => !owned.has(p.slug)).sort((a, b) => fits(a) - fits(b))[0];

  const missing = STEPS.filter((s) => !steps.has(s))
    .map((s) => pick(products.filter((p) => p.category === s)))
    .filter((p): p is Product => !!p);

  // Already a full routine: offer what pairs with it at the same time of day.
  if (missing.length < limit) {
    const extra = products
      .filter((p) => !owned.has(p.slug) && !missing.includes(p) && p.category !== "Colour")
      .sort((a, b) => fits(a) - fits(b));
    missing.push(...extra.slice(0, limit - missing.length));
  }
  return missing.slice(0, limit);
}
