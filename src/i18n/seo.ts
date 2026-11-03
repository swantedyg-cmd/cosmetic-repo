import type { Metadata } from "next";
import { localeInfo, localePath, locales, type Locale } from "./config";

/** Canonical URL for this language plus hreflang links to the other two. */
export function alternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(locales.map((l) => [localeInfo[l].intl.split("-u-")[0], localePath(l, path)])),
      "x-default": localePath("en", path),
    },
  };
}

export function ogLocale(locale: Locale) {
  return {
    locale: localeInfo[locale].og,
    alternateLocale: locales.filter((l) => l !== locale).map((l) => localeInfo[l].og),
  };
}
