"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
            <Link href="/cart" aria-label={`Bag, ${count} items`} className="relative hover:text-ember">
              <BagIcon />
              {count > 0 && (
                <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-tangerine px-1 text-[9px] font-medium text-canvas">
                  {count}
                </span>
              )}
            </Link>
            <Link href="/shop" className="text-sm lg:hidden">Shop</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
