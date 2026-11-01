// The site's public address, used for canonical links, the sitemap and social cards.
// Set NEXT_PUBLIC_SITE_URL to the client's domain at launch; Vercel's production URL is the fallback.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const BRAND = "Solenne";
export const TAGLINE = "Skincare you can see through";
export const DESCRIPTION = "Skincare in clear glass, with every active ingredient printed at its exact percentage.";
