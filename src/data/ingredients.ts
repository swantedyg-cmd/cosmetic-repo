import { products } from "./products";

// What each active does, and the range it's typically used at in leave-on skincare.
// Placeholder copy and ranges — have the client's formulator confirm before launch.

export type Job = "Cleanse" | "Hydrate" | "Barrier" | "Tone" | "Renew" | "Nourish";

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
  Glycerin: { does: "Draws water into the skin and keeps it there. The quiet workhorse of hydration.", job: "Hydrate", range: [2, 10] },
  Allantoin: { does: "Soothes and softens, so actives and cleansing feel gentler.", job: "Barrier", range: [0.1, 2] },
  "Glycolic acid": { does: "The smallest AHA. Loosens dull surface cells for smoother skin.", job: "Renew", range: [5, 10] },
  "Lactic acid": { does: "A gentler AHA that exfoliates and hydrates at the same time.", job: "Renew", range: [2, 10] },
  "Ascorbic acid": { does: "Pure vitamin C. Brightens and helps defend against daily pollution.", job: "Tone", range: [8, 20] },
  "Ferulic acid": { does: "A plant antioxidant that helps vitamins C and E stay stable.", job: "Tone", range: [0.5, 1] },
  Retinal: { does: "Vitamin A one step from its active form. Smooths texture and fine lines.", job: "Renew", range: [0.05, 0.1] },
  Bakuchiol: { does: "A plant extract that supports retinoids and softens the adjustment.", job: "Renew", range: [0.5, 2] },
  Caffeine: { does: "Tightens the look of puffiness, especially around the eyes.", job: "Tone", range: [1, 5] },
  Peptides: { does: "Short chains of amino acids that support firmness over time.", job: "Renew", range: [1, 10] },
  Kaolin: { does: "A soft white clay that absorbs excess oil without stripping.", job: "Cleanse", range: [10, 40] },
  "French green clay": { does: "A mineral-rich clay that draws oil out of congested pores.", job: "Cleanse", range: [5, 30] },
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

export const JOBS: Job[] = ["Cleanse", "Hydrate", "Barrier", "Tone", "Renew", "Nourish"];
