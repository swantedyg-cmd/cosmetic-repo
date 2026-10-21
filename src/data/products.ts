// Placeholder catalogue — swap in the client's real products when they arrive.

export type BottleShape = "dropper" | "pump" | "jar" | "stick";

export type Active = { name: string; percent: number };

export type Variant = {
  id: string;
  label: string;
  price: number;
  /** Overrides the product's liquid color (used for shades). */
  color?: string;
};

export type Product = {
  slug: string;
  name: string;
  /** Short word rendered behind the glass in the hero. */
  word: string;
  kind: string;
  shape: BottleShape;
  color: string;
  tagline: string;
  description: string;
  actives: Active[];
  variants: Variant[];
  variantLabel: string;
  howToUse: string;
};

export const products: Product[] = [
  {
    slug: "ember-facial-oil",
    name: "Ember Facial Oil",
    word: "EMBER",
    kind: "Face oil",
    shape: "dropper",
    color: "#F7651A",
    tagline: "A dry-touch oil that sinks in before your next step.",
    description:
      "Squalane and sea buckthorn soften dry patches and leave a low sheen, not a slick. Three drops cover the whole face.",
    actives: [
      { name: "Squalane", percent: 40 },
      { name: "Sea buckthorn oil", percent: 5 },
      { name: "Vitamin E", percent: 1 },
    ],
    variants: [
      { id: "15ml", label: "15 ml", price: 32 },
      { id: "30ml", label: "30 ml", price: 48 },
    ],
    variantLabel: "Size",
    howToUse: "Evening. Warm 3 drops between palms and press into damp skin.",
  },
  {
    slug: "dew-serum",
    name: "Dew Serum",
    word: "DEW",
    kind: "Serum",
    shape: "pump",
    color: "#FFB79C",
    tagline: "Water-light serum for visible pores and dull days.",
    description:
      "Niacinamide and zinc even out tone and keep shine in check, while hyaluronic acid holds water in the skin for hours.",
    actives: [
      { name: "Niacinamide", percent: 10 },
      { name: "Hyaluronic acid", percent: 2 },
      { name: "Zinc PCA", percent: 1 },
    ],
    variants: [
      { id: "30ml", label: "30 ml", price: 42 },
      { id: "50ml", label: "50 ml", price: 58 },
    ],
    variantLabel: "Size",
    howToUse: "Morning and evening. Two pumps after cleansing, before cream.",
  },
  {
    slug: "veil-barrier-cream",
    name: "Veil Barrier Cream",
    word: "VEIL",
    kind: "Moisturiser",
    shape: "jar",
    color: "#F3ECE6",
    tagline: "A cushiony cream that rebuilds a stressed barrier.",
    description:
      "Ceramides, cholesterol and panthenol in the ratio skin uses itself. Calms tightness after actives, wind or a long flight.",
    actives: [
      { name: "Panthenol", percent: 5 },
      { name: "Ceramides", percent: 3 },
      { name: "Cholesterol", percent: 1 },
    ],
    variants: [
      { id: "50ml", label: "50 ml", price: 54 },
      { id: "refill", label: "50 ml refill", price: 44 },
    ],
    variantLabel: "Size",
    howToUse: "Last step, morning and evening. A pea-sized amount per area.",
  },
  {
    slug: "tint-balm",
    name: "Tint Balm",
    word: "TINT",
    kind: "Lip & cheek",
    shape: "stick",
    color: "#C9737A",
    tagline: "Sheer colour for lips and cheeks, in one swipe.",
    description:
      "A melting balm with shea and a buildable wash of pigment. Tap onto cheeks with fingers or wear straight on lips.",
    actives: [
      { name: "Shea butter", percent: 20 },
      { name: "Jojoba oil", percent: 10 },
    ],
    variants: [
      { id: "rose", label: "Rose", price: 24, color: "#C9737A" },
      { id: "coral", label: "Coral", price: 24, color: "#F15730" },
      { id: "cocoa", label: "Cocoa", price: 24, color: "#8A5644" },
    ],
    variantLabel: "Shade",
    howToUse: "Swipe onto lips, or dab onto cheeks and blend with fingertips.",
  },
];

export const featured = products.slice(0, 3);

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function formatPrice(n: number) {
  return `€${n}`;
}

// Placeholder brand claims for the stat callout and trust row — confirm with the client.
export const brandStat = { value: "98%", label: "Ingredients of natural origin, across the whole range" };
