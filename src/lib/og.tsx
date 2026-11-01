import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Shared bits for the generated social cards (1200×630), drawn with next/og.

export const ogSize = { width: 1200, height: 630 };

export async function ogFonts() {
  const [light, medium] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/onest-200.woff")),
    readFile(join(process.cwd(), "public/fonts/onest-500.woff")),
  ]);
  return [
    { name: "Onest", data: light, weight: 200 as const, style: "normal" as const },
    { name: "Onest", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

/** A local photo as a data URL, so the card never depends on a network fetch. */
export async function ogPhoto(src: string) {
  const data = await readFile(join(process.cwd(), "public", src));
  return `data:image/jpeg;base64,${data.toString("base64")}`;
}
