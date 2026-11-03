import { localeInfo, localePath, type Locale } from "./config";
import { fmt, formatNumber, formatPrice, plural, type Plural } from "./format";
import { getLocalProduct, localizeProduct, localizeProducts, photoAlt } from "./localize";
import type { Dictionary } from "./dictionaries/en";
import type { Product } from "@/data/products";
import type { Photo } from "@/data/photos";

/** Everything a component needs to speak the page's language. Works on server and client. */
export function makeI18n(locale: Locale, t: Dictionary) {
  return {
    locale,
    t,
    dir: localeInfo[locale].dir,
    rtl: localeInfo[locale].dir === "rtl",
    fmt,
    plural: (forms: Plural, n: number, vars?: Record<string, string | number>) => plural(locale, forms, n, vars),
    price: (n: number) => formatPrice(locale, n),
    num: (n: number, digits?: number) => formatNumber(locale, n, digits),
    href: (path: string) => localePath(locale, path),
    product: (p: Product) => localizeProduct(p, t),
    products: (list: Product[]) => localizeProducts(list, t),
    bySlug: (slug: string) => getLocalProduct(slug, t),
    alt: (photo: Photo) => photoAlt(photo, t),
  };
}

export type I18n = ReturnType<typeof makeI18n>;
