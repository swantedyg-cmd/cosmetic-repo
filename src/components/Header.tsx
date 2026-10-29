"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { BagIcon, SearchIcon, UserIcon } from "./icons";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/routine", label: "Routine finder" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { count } = useCart();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <p className="bg-graphite py-2 text-center text-[11px] tracking-normal text-canvas">
        Free shipping over €60 · A sample with every order
      </p>
      <div className="border-b border-mist bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 md:px-10">
          <Link href="/" className="text-[15px] font-semibold uppercase tracking-[-0.02em] text-ink">
            Solenne
          </Link>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 gap-6 text-sm text-ink lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`underline-offset-[6px] decoration-apricot decoration-[1.5px] hover:underline ${
                  path.startsWith(n.href) ? "underline" : ""
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-5 text-ink">
            <Link href="/shop" aria-label="Search products" className="hover:text-ember">
              <SearchIcon />
            </Link>
            <Link href="/contact" aria-label="Account" className="hidden hover:text-ember sm:block">
              <UserIcon />
            </Link>
            <Link href="/cart" aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`} className="relative hover:text-ember">
              <BagIcon />
              {count > 0 && (
                <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-tangerine px-1 text-[9px] font-medium text-canvas">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="text-sm lg:hidden"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </div>

      {/* Phone and tablet menu: drops down under the bar, links stagger in. */}
      <div
        id="mobile-menu"
        className={`mobile-menu lg:hidden ${open ? "is-open" : ""}`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav className="mx-auto flex max-w-[1280px] flex-col px-5 pb-10 pt-4 md:px-10">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              style={{ "--i": i } as React.CSSProperties}
              className={`mobile-menu-link display border-b border-mist py-4 text-[clamp(2rem,8vw,3rem)] ${
                path.startsWith(n.href) ? "text-ember" : "text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
