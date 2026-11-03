import { products as base, type Product } from "@/data/products";
import type { Photo } from "@/data/photos";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

// Catalogue copy lives in src/data in English. These helpers lay the active
// language's copy over it, keeping slugs, prices and percentages untouched.

const cache = new WeakMap<Dictionary, Map<string, Product>>();

/** Same object for the same product and language, so 3D label textures don't redraw. */
export function localizeProduct(p: Product, dict: Dictionary): Product {
  let byDict = cache.get(dict);
  if (!byDict) cache.set(dict, (byDict = new Map()));
  const hit = byDict.get(p.slug);
  if (hit) return hit;
  const c = dict.catalog;
  const t = c.products[p.slug];
  const out: Product = {
    ...p,
    ...(t && {
      name: t.name,
      kind: t.kind,
      tagline: t.tagline,
      description: t.description,
      howToUse: t.howToUse,
      variantLabel: t.variantLabel,
    }),
    actives: p.actives.map((a) => ({ ...a, name: activeName(a.name, dict) })),
    variants: p.variants.map((v) => ({
      ...v,
      label: t?.variants?.[v.id] ?? v.label.replace(/\bml\b/, c.ml),
    })),
  };
  byDict.set(p.slug, out);
  return out;
}

export function localizeProducts(list: Product[], dict: Dictionary) {
  return list.map((p) => localizeProduct(p, dict));
}

export function getLocalProduct(slug: string, dict: Dictionary) {
  const p = base.find((x) => x.slug === slug);
  return p && localizeProduct(p, dict);
}

export function activeName(name: string, dict: Dictionary) {
  return dict.catalog.actives[name] ?? name;
}

/** Alt text by photo file, falling back to the English caption. */
export function photoAlt(photo: Photo, dict: Dictionary) {
  const id = photo.src.split("/").pop()!.replace(/\.\w+$/, "");
  return dict.catalog.photos[id] ?? photo.alt;
}

/** For sorting and the A–Z rail: accents and Arabic hamza forms fold to their base letter. */
export function initial(name: string, locale: Locale) {
  const ch = name.trim()[0] ?? "";
  if (locale === "ar") return ch.replace(/[أإآٱ]/, "ا");
  return ch.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();
}
