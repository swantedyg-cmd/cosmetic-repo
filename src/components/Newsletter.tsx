"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/client";

export default function Newsletter() {
  const [joined, setJoined] = useState(false);
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10">
      <div className="keep-day grid gap-8 rounded-[10px] bg-tangerine px-6 py-12 text-canvas md:grid-cols-2 md:items-end md:px-12 md:py-16">
        <div>
          <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)] !text-canvas">{t.newsletter.title}</h2>
          <p className="mt-4 max-w-sm">{t.newsletter.body}</p>
        </div>
        {joined ? (
          <p className="text-lg" role="status">{t.newsletter.joined}</p>
        ) : (
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setJoined(true);
            }}
          >
            <label htmlFor="nl-email" className="sr-only">{t.common.emailLabel}</label>
            <input
              id="nl-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder={t.common.emailPlaceholder}
              className="flex-1 rounded-[30px] border-2 border-canvas bg-transparent px-5 py-[13px] text-canvas outline-none placeholder:text-canvas/75"
            />
            <button className="rounded-[600px] bg-canvas px-10 py-[15px] text-sm font-medium text-ember transition-colors hover:bg-ink hover:text-canvas">
              {t.newsletter.cta}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
