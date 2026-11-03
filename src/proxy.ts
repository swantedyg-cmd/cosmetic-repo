import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";

// Every page lives under /en, /fr or /ar. A bare path ("/", "/shop/dew-serum") is sent to
// the language the visitor picked before, or else the best match from their browser.

function preferred(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .filter((x) => x.lang && !Number.isNaN(x.q))
    .sort((a, b) => b.q - a.q);
  return ranked.map((x) => x.lang).find((l): l is Locale => isLocale(l)) ?? defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];
  if ((locales as readonly string[]).includes(first)) return NextResponse.next();
  // Files from /public (fonts, photos) are never pages.
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${preferred(request)}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url);
  // The redirect depends on these, so caches must not share it between visitors.
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

export const config = {
  // Pages only: skip Next internals, the API, and anything with a dot (files, sitemap, robots).
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
