import en, { type Dictionary } from "./dictionaries/en";
import fr from "./dictionaries/fr";
import ar from "./dictionaries/ar";
import { defaultLocale, isLocale, type Locale } from "./config";

const dictionaries: Record<Locale, Dictionary> = { en, fr, ar };

export function getDictionary(locale: string): Dictionary {
  return dictionaries[isLocale(locale) ? locale : defaultLocale];
}

export type { Dictionary };
