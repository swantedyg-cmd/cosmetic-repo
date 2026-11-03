"use client";

import Link from "@/i18n/Link";
import { useI18n } from "@/i18n/client";
import LayerStack from "./LayerStack";
import Reveal from "./Reveal";

const SAMPLE = ["dew-serum", "ember-facial-oil", "veil-barrier-cream"];

// Home-page doorway to the routine finder, previewing the layer stack it builds.
export default function RoutineTeaser() {
  const i = useI18n();
  const { t } = i;
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
        <Reveal>
          <p className="text-sm text-smoke">{t.routineTeaser.eyebrow}</p>
          <h2 className="display mt-3 text-[clamp(2.2rem,4.4vw,3.25rem)] text-balance">
            {t.routineTeaser.title}
          </h2>
          <p className="mt-6 max-w-sm text-smoke">
            {t.routineTeaser.body}
          </p>
          <Link href="/routine" className="btn mt-8">{t.routineTeaser.cta}</Link>
        </Reveal>
        <Reveal variant="clip" className="relative aspect-[5/4] overflow-hidden rounded-[15px] bg-blush">
          <LayerStack steps={SAMPLE.map((s) => i.bySlug(s)!)} className="absolute inset-0" />
        </Reveal>
      </div>
    </section>
  );
}
