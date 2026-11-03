"use client";

import { setTheme, useTheme } from "@/lib/theme";
import { useI18n } from "@/i18n/client";

/**
 * Day / Night switch: a small sun that sets into a crescent. The pill slides
 * like a dial so it reads as a ritual change, not a dark-mode checkbox.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const night = theme === "night";
  const { t } = useI18n();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={night}
      aria-label={t.theme.label}
      title={night ? t.theme.toDay : t.theme.toNight}
      onClick={() => setTheme(night ? "day" : "night")}
      className={`theme-toggle ${night ? "is-night" : ""} ${className}`}
    >
      <span className="theme-toggle-track" aria-hidden>
        <span className="theme-toggle-knob">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle className="theme-sun" cx="12" cy="12" r="4.2" />
            <g className="theme-rays">
              <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
            </g>
            <path className="theme-moon" d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" />
          </svg>
        </span>
      </span>
      <span className="theme-toggle-text" aria-hidden>
        {night ? t.theme.night : t.theme.day}
      </span>
    </button>
  );
}
