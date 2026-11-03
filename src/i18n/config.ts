// The site's languages. Every page lives under /{locale}/…, and the proxy sends
// bare paths to the visitor's saved choice or their browser's preferred language.

export const locales = ["en", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Remembers an explicit choice from the language switcher, read by the proxy. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export const localeInfo: Record<
  Locale,
  { name: string; short: string; dir: "ltr" | "rtl"; intl: string; og: string; flag: "gb" | "fr" | "ma" }
> = {
  en: { name: "English", short: "EN", dir: "ltr", intl: "en-GB", og: "en_GB", flag: "gb" },
  fr: { name: "Français", short: "FR", dir: "ltr", intl: "fr-FR", og: "fr_FR", flag: "fr" },
  // Western digits, as on packaging and in most of the Maghreb and the Gulf.
  ar: { name: "العربية", short: "AR", dir: "rtl", intl: "ar-u-nu-latn", og: "ar_AR", flag: "ma" },
};

/** "/shop" → "/fr/shop"; "/" → "/fr". */
export function localePath(locale: Locale, path: string) {
  if (!path.startsWith("/")) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Drops the locale prefix: "/fr/shop" → "/shop". */
export function stripLocale(pathname: string) {
  const [, first, ...rest] = pathname.split("/");
  if (!isLocale(first)) return pathname || "/";
  return `/${rest.join("/")}`;
}
