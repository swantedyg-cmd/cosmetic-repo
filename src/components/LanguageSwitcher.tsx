"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import Flag from "./Flag";
import { useI18n } from "@/i18n/client";
import { LOCALE_COOKIE, localeInfo, localePath, locales, stripLocale, type Locale } from "@/i18n/config";

/** Same page in another language. A full load, so the page's direction and fonts switch cleanly. */
function useTargets() {
  const path = stripLocale(usePathname() ?? "/");
  return locales.map((l) => ({ locale: l, href: localePath(l, path), ...localeInfo[l] }));
}

function remember(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/** Header control: the current flag opens a short list of the three languages. */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t, fmt } = useI18n();
  const targets = useTargets();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = localeInfo[locale];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        root.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    // Land on the current language so arrow-free tabbing starts in the right place.
    root.current?.querySelector<HTMLAnchorElement>('[aria-current="true"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={fmt(t.language.current, { name: current.name })}
        onClick={() => setOpen((o) => !o)}
        className="lang-trigger flex items-center gap-2 rounded-full py-1 text-xs font-medium text-ink hover:text-ember"
      >
        <Flag code={current.flag} className="h-[14px] w-[19px] rounded-[3px]" />
        <span className="hidden tracking-[0.06em] sm:inline">{current.short}</span>
        <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        id={menuId}
        hidden={!open}
        className="lang-menu absolute end-0 top-[calc(100%+14px)] z-10 w-52 rounded-[12px] border border-mist bg-canvas p-1.5 shadow-[0_18px_40px_-18px_rgba(13,23,23,0.35)]"
      >
        <p className="px-3 pb-1.5 pt-2 text-[11px] text-smoke">{t.language.label}</p>
        <ul>
          {targets.map((x) => (
            <li key={x.locale}>
              <a
                href={x.href}
                hrefLang={x.locale}
                lang={x.locale}
                aria-current={x.locale === locale ? "true" : undefined}
                onClick={() => remember(x.locale)}
                className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm transition-colors ${
                  x.locale === locale ? "bg-blush text-ink" : "text-ink hover:bg-blush/60"
                }`}
              >
                <Flag code={x.flag} className="h-[15px] w-[20px] rounded-[3px]" />
                <span className="flex-1">{x.name}</span>
                <span className="text-[11px] tracking-[0.06em] text-smoke">{x.short}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Phone menu: all three languages side by side, one tap each. */
export function LanguageRow() {
  const { locale, t } = useI18n();
  const targets = useTargets();
  return (
    <div className="flex items-center justify-between gap-4 border-b border-mist py-4">
      <span className="text-sm text-smoke">{t.language.label}</span>
      <ul className="flex gap-1.5">
        {targets.map((x) => (
          <li key={x.locale}>
            <a
              href={x.href}
              hrefLang={x.locale}
              lang={x.locale}
              aria-current={x.locale === locale ? "true" : undefined}
              aria-label={x.name}
              onClick={() => remember(x.locale)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                x.locale === locale ? "border-ink bg-ink text-canvas" : "border-ink/20 text-ink hover:border-ink"
              }`}
            >
              <Flag code={x.flag} className="h-[12px] w-[16px] rounded-[2px]" />
              {x.short}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
