import { products } from "./products";

// What each active does, and the range it's typically used at in leave-on skincare.
// Placeholder copy and ranges — have the client's formulator confirm before launch.

export type Job = "Hydrate" | "Barrier" | "Tone" | "Nourish";

type Info = { does: string; job: Job; range?: [number, number] };

const INFO: Record<string, Info> = {
  Squalane: { does: "A light oil skin already makes. Softens without feeling greasy.", job: "Nourish", range: [5, 100] },
  "Sea buckthorn oil": { does: "Rich in omegas and carotenoids. Gives the oil its amber colour.", job: "Nourish", range: [1, 10] },
  "Vitamin E": { does: "An antioxidant that also keeps the oils from going off.", job: "Nourish", range: [0.1, 1] },
  Niacinamide: { does: "Evens out tone and helps visible pores look smaller over time.", job: "Tone", range: [2, 10] },
  "Hyaluronic acid": { does: "Holds water in the top layers of skin, so it looks plumper.", job: "Hydrate", range: [0.1, 2] },
  "Zinc PCA": { does: "Helps keep shine in check through the day.", job: "Tone", range: [0.1, 1] },
  Panthenol: { does: "Pro-vitamin B5. Calms and helps skin hold moisture.", job: "Barrier", range: [1, 5] },
  Ceramides: { does: "The lipids that hold skin cells together, topped up from outside.", job: "Barrier", range: [0.1, 3] },
  Cholesterol: { does: "Works alongside ceramides to repair a stressed barrier.", job: "Barrier", range: [0.5, 2] },
  "Shea butter": { does: "A melting butter that cushions lips and dry patches.", job: "Nourish", range: [5, 30] },
  "Jojoba oil": { does: "A liquid wax close to skin's own sebum. Keeps the balm glidey.", job: "Nourish", range: [1, 20] },
};

export type Ingredient = Info & { name: string; percent: number; product: { slug: string; name: string } };

export const ingredients: Ingredient[] = products
  .flatMap((p) =>
    p.actives.map((a) => ({
      name: a.name,
      percent: a.percent,
      product: { slug: p.slug, name: p.name },
      ...(INFO[a.name] ?? { does: "", job: "Nourish" as Job }),
    })),
  )
  .sort((a, b) => a.name.localeCompare(b.name));

export const JOBS: Job[] = ["Hydrate", "Barrier", "Tone", "Nourish"];
