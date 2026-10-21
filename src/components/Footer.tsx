import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[1280px] px-5 pb-8 md:px-10">
      <div className="grid gap-10 border-t border-graphite pt-10 md:grid-cols-[2fr_1fr_1fr]">
        <p className="max-w-xs text-sm text-smoke">Skincare in clear glass, with every percentage on the label.</p>
        <ul className="space-y-2 text-sm">
          <li><Link href="/shop" className="hover:text-ember">Shop</Link></li>
          <li><Link href="/about" className="hover:text-ember">About</Link></li>
          <li><Link href="/contact" className="hover:text-ember">Contact</Link></li>
        </ul>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-ember">Instagram</a></li>
          <li><a href="#" className="hover:text-ember">TikTok</a></li>
        </ul>
      </div>
      {/* Oversized wordmark closes the page like a magazine back cover. */}
      <p aria-hidden className="mt-16 select-none text-center text-[21vw] font-extralight uppercase leading-[0.8] tracking-[-0.09em] text-ink xl:text-[16.5rem]">
        Solenne
      </p>
      <p className="mt-6 text-xs text-smoke">© 2026 Solenne</p>
    </footer>
  );
}
