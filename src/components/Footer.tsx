"use client";

import Link from "@/i18n/Link";
import { useI18n } from "@/i18n/client";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="relative z-[1] mx-auto w-full max-w-[1280px] px-5 pb-8 md:px-10">
      <div className="grid gap-10 border-t border-graphite pt-10 md:grid-cols-[2fr_1fr_1fr]">
        <p className="max-w-xs text-sm text-smoke">{t.footer.blurb}</p>
        <ul className="space-y-2 text-sm">
          <li><Link href="/shop" className="hover:text-ember">{t.header.shop}</Link></li>
          <li><Link href="/routine" className="hover:text-ember">{t.header.routine}</Link></li>
          <li><Link href="/ingredients" className="hover:text-ember">{t.footer.ingredientIndex}</Link></li>
          <li><Link href="/about" className="hover:text-ember">{t.header.about}</Link></li>
          <li><Link href="/contact" className="hover:text-ember">{t.header.contact}</Link></li>
        </ul>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-ember">Instagram</a></li>
          <li><a href="#" className="hover:text-ember">TikTok</a></li>
        </ul>
      </div>
      {/* Oversized wordmark closes the page like a magazine back cover. */}
      <p aria-hidden dir="ltr" className="mt-16 select-none text-center text-[21vw] font-extralight uppercase leading-[0.8] tracking-[-0.09em] text-ink xl:text-[16.5rem]">
        Solenne
      </p>
      <p className="mt-6 text-xs text-smoke">© 2026 Solenne</p>
    </footer>
  );
}
