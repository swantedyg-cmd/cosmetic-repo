import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { SITE_URL } from "@/lib/site";
import { localeInfo, localePath, locales } from "@/i18n/config";

// One entry per page per language, each listing its two translations.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    ...["/", "/shop", "/routine", "/ingredients", "/about", "/contact"].map((path) => ({ path, priority: path === "/" ? 1 : 0.7 })),
    ...products.map((p) => ({ path: `/shop/${p.slug}`, priority: 0.8 })),
  ];
  return paths.flatMap(({ path, priority }) =>
    locales.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [localeInfo[l].intl.split("-u-")[0], `${SITE_URL}${localePath(l, path)}`]),
        ),
      },
    })),
  );
}
