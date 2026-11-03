import { localeInfo, type Locale } from "./config";

/** A message that changes with a count. Arabic uses all six forms; English and French two. */
export type Plural = { zero?: string; one?: string; two?: string; few?: string; many?: string; other: string };

type Vars = Record<string, string | number>;

/** Fills {name} placeholders. */
export function fmt(template: string, vars: Vars = {}) {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

const rules = new Map<Locale, Intl.PluralRules>();

/** Picks the plural form for n and fills it; {n} is always available. */
export function plural(locale: Locale, forms: Plural, n: number, vars: Vars = {}) {
  let r = rules.get(locale);
  if (!r) rules.set(locale, (r = new Intl.PluralRules(localeInfo[locale].intl)));
  // Arabic speakers write "0" with the zero form; Intl only reports it for exactly 0.
  const form = (n === 0 && forms.zero) || forms[r.select(n) as keyof Plural] || forms.other;
  return fmt(form, { n: formatNumber(locale, n), ...vars });
}

const money = new Map<Locale, Intl.NumberFormat>();

/** Whole euros print without decimals: €32 / 32 € / ‏32 €. */
export function formatPrice(locale: Locale, n: number) {
  let f = money.get(locale);
  if (!f)
    money.set(
      locale,
      (f = new Intl.NumberFormat(localeInfo[locale].intl, {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })),
    );
  return f.format(n);
}

export function formatNumber(locale: Locale, n: number, digits?: number) {
  return new Intl.NumberFormat(localeInfo[locale].intl, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits ?? 2,
  }).format(n);
}
