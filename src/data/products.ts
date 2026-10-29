// Demo catalogue: realistic formulas and prices for showing the client the site with a full range.
// Swap in the client's real products when they arrive.

export type BottleShape = "dropper" | "pump" | "jar" | "stick";

export type Active = { name: string; percent: number };

export type Variant = {
  id: string;
  label: string;
  price: number;
  /** Overrides the product's liquid color (used for shades). */
  color?: string;
};

export type Category = "Cleanse" | "Treat" | "Moisturise" | "Colour";

/** Order the shop lists categories in: the order they go on. */
export const CATEGORIES: Category[] = ["Cleanse", "Treat", "Moisturise", "Colour"];

export type Product = {
  slug: string;
  name: string;
  /** Short word rendered behind the glass in the hero. */
  word: string;
  kind: string;
  category: Category;
  badge?: "New";
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
    category: "Moisturise",
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
    category: "Treat",
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
    category: "Moisturise",
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
    category: "Colour",
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
  {
    slug: "halo-gel-cleanser",
    name: "Halo Gel Cleanser",
    word: "HALO",
    kind: "Cleanser",
    category: "Cleanse",
    badge: "New",
    shape: "pump",
    color: "#DCEFEA",
    tagline: "A low-foam gel that leaves skin clean, not squeaky.",
    description:
      "Mild sugar-based cleansers lift sunscreen and the day's oil without stripping. Glycerin and panthenol keep skin comfortable straight after rinsing.",
    actives: [
      { name: "Glycerin", percent: 5 },
      { name: "Panthenol", percent: 1 },
      { name: "Allantoin", percent: 0.2 },
    ],
    variants: [
      { id: "150ml", label: "150 ml", price: 26 },
      { id: "300ml", label: "300 ml", price: 38 },
    ],
    variantLabel: "Size",
    howToUse: "Morning and evening. Massage one pump into damp skin for 30 seconds, then rinse with lukewarm water.",
  },
  {
    slug: "lucent-tonic",
    name: "Lucent Tonic",
    word: "LUCENT",
    kind: "Exfoliating toner",
    category: "Treat",
    badge: "New",
    shape: "pump",
    color: "#F6C9BF",
    tagline: "A gentle acid tonic for smoother, brighter skin.",
    description:
      "Glycolic and lactic acid loosen dull surface cells so skin looks more even and catches the light. Buffered to pH 3.8 so it works without stinging.",
    actives: [
      { name: "Glycolic acid", percent: 7 },
      { name: "Lactic acid", percent: 3 },
      { name: "Allantoin", percent: 0.5 },
    ],
    variants: [
      { id: "100ml", label: "100 ml", price: 29 },
      { id: "200ml", label: "200 ml", price: 42 },
    ],
    variantLabel: "Size",
    howToUse: "Evening, two or three times a week. Sweep over dry skin with a cotton pad. Wear sunscreen the next day.",
  },
  {
    slug: "lumen-c-serum",
    name: "Lumen C Serum",
    word: "LUMEN",
    kind: "Vitamin C serum",
    category: "Treat",
    badge: "New",
    shape: "dropper",
    color: "#F2B33D",
    tagline: "Pure vitamin C, stabilised, for a brighter morning face.",
    description:
      "L-ascorbic acid at 15% with vitamin E and ferulic acid, the pairing shown to keep vitamin C stable for longer. In amber glass to keep the light out.",
    actives: [
      { name: "Ascorbic acid", percent: 15 },
      { name: "Vitamin E", percent: 1 },
      { name: "Ferulic acid", percent: 0.5 },
    ],
    variants: [{ id: "30ml", label: "30 ml", price: 52 }],
    variantLabel: "Size",
    howToUse: "Morning. Four drops after cleansing, then moisturiser and sunscreen.",
  },
  {
    slug: "nocturne-retinal-serum",
    name: "Nocturne Retinal Serum",
    word: "NIGHT",
    kind: "Retinal serum",
    category: "Treat",
    badge: "New",
    shape: "dropper",
    color: "#E9C46A",
    tagline: "Fast-acting vitamin A, cushioned in squalane.",
    description:
      "Retinal is one step closer to the form skin uses than retinol, so a low 0.1% goes further. Squalane and bakuchiol soften the first weeks.",
    actives: [
      { name: "Squalane", percent: 10 },
      { name: "Bakuchiol", percent: 1 },
      { name: "Retinal", percent: 0.1 },
    ],
    variants: [{ id: "30ml", label: "30 ml", price: 58 }],
    variantLabel: "Size",
    howToUse: "Evening only. Start twice a week and build up. Three drops on dry skin, then moisturiser. Not during pregnancy.",
  },
  {
    slug: "cloud-eye-cream",
    name: "Cloud Eye Cream",
    word: "CLOUD",
    kind: "Eye cream",
    category: "Moisturise",
    badge: "New",
    shape: "jar",
    color: "#F7EFE9",
    tagline: "A whipped eye cream that wakes up tired eyes.",
    description:
      "Caffeine helps reduce morning puffiness, peptides support firmness over time, and niacinamide softens the look of shadows.",
    actives: [
      { name: "Niacinamide", percent: 4 },
      { name: "Caffeine", percent: 3 },
      { name: "Peptides", percent: 2 },
    ],
    variants: [{ id: "15ml", label: "15 ml", price: 38 }],
    variantLabel: "Size",
    howToUse: "Morning and evening. Tap a rice-grain amount along the orbital bone with your ring finger.",
  },
  {
    slug: "green-clay-mask",
    name: "Green Clay Mask",
    word: "CLAY",
    kind: "Clay mask",
    category: "Treat",
    badge: "New",
    shape: "jar",
    color: "#A9B89A",
    tagline: "A ten-minute reset for congested skin.",
    description:
      "Kaolin and French green clay soak up excess oil and leave pores looking clearer, without the tight, cracked feeling. Zinc PCA keeps shine down for days after.",
    actives: [
      { name: "Kaolin", percent: 20 },
      { name: "French green clay", percent: 10 },
      { name: "Zinc PCA", percent: 0.5 },
    ],
    variants: [{ id: "75ml", label: "75 ml", price: 36 }],
    variantLabel: "Size",
    howToUse: "Once or twice a week. Smooth a thin layer over clean skin, leave for 10 minutes, rinse before it fully dries.",
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
