import { encode } from "uqr";
import { SITE_URL } from "./site";

// Printed codes point at /s/<slug>: short enough for a small, easy-to-scan code, and
// language-free, so the proxy opens the page in whatever language the scanner's phone uses.

/** Previews encode their own address, so a test print can be scanned before launch. */
const QR_BASE =
  process.env.VERCEL_ENV === "preview" && (process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL)
    ? `https://${process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL}`
    : SITE_URL;

export const scanUrl = (slug: string) => `${QR_BASE}/s/${slug}`;

/** The code as rows of "1" (dark) and "0" (light), without the quiet zone. */
export function qrModules(text: string): string[] {
  // M recovers from 15% damage: enough for scuffed packaging, still a small code.
  const { data } = encode(text, { ecc: "M", border: 0 });
  return data.map((row) => row.map((dark) => (dark ? "1" : "0")).join(""));
}

/** The three corner squares the scanner locks on to. */
export function isFinder(x: number, y: number, size: number) {
  return (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
}

const QUIET = 4;

/**
 * Print-ready SVG: rounded modules and soft corner eyes, ink on white. Colour stays out of
 * the code itself, because scanners need strong contrast; the brand lives around it.
 */
export function qrSvg(text: string, { ink = "#0d1717", paper = "#ffffff" } = {}) {
  const rows = qrModules(text);
  const size = rows.length;
  const full = size + QUIET * 2;
  const dots: string[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < size; x++) {
      if (row[x] === "1" && !isFinder(x, y, size))
        dots.push(`<rect x="${x + QUIET + 0.06}" y="${y + QUIET + 0.06}" width="0.88" height="0.88" rx="0.3"/>`);
    }
  });
  const eyes = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]
    .map(([x, y]) => {
      const ox = x + QUIET;
      const oy = y + QUIET;
      return (
        `<rect x="${ox + 0.5}" y="${oy + 0.5}" width="6" height="6" rx="1.7" fill="none" stroke="${ink}" stroke-width="1"/>` +
        `<rect x="${ox + 2}" y="${oy + 2}" width="3" height="3" rx="0.9"/>`
      );
    })
    .join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${full} ${full}" shape-rendering="geometricPrecision">` +
    `<rect width="${full}" height="${full}" fill="${paper}"/>` +
    `<g fill="${ink}">${dots.join("")}${eyes}</g></svg>`
  );
}
