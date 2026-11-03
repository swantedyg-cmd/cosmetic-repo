"use client";

import Link from "@/i18n/Link";
import { useI18n } from "@/i18n/client";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-40 md:px-12">
      <p className="display numeric text-[clamp(5rem,14vw,9rem)] !text-graphite">404</p>
      <h1 className="display mt-6 text-[clamp(2rem,4vw,3rem)]">{t.notFound.title}</h1>
      <p className="mt-4 text-smoke">{t.notFound.body}</p>
      <Link href="/shop" className="btn mt-8">{t.notFound.cta}</Link>
    </div>
  );
}
