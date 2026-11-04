import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { locales } from "@/i18n/config";

// The bag, the QR sheet and the scan landing pages stay out of search; the product pages rank instead.
const PRIVATE = ["/cart", "/qr", "/s/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", ...PRIVATE, ...locales.flatMap((l) => PRIVATE.map((p) => `/${l}${p}`))],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
