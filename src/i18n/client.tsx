"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import { makeI18n, type I18n } from "./make";

// The layout hands down only the active language's dictionary, once per page load.
const I18nContext = createContext<{ locale: Locale; dict: Dictionary } | null>(null);

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dictionary; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return useMemo(() => makeI18n(ctx.locale, ctx.dict), [ctx]);
}
