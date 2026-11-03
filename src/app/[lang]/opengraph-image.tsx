import { ImageResponse } from "next/og";
import { ogFonts, ogPhoto, ogSize } from "@/lib/og";
import { productPhotos } from "@/data/photos";
import { brandStat } from "@/data/products";
import { BRAND } from "@/lib/site";
import { getDictionary } from "@/i18n";
import { locales } from "@/i18n/config";

export const alt = BRAND;
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const photo = await ogPhoto(productPhotos["dew-serum"][0].src);
  // The card renderer can't shape Arabic, so the Arabic card says it with the figure alone.
  const words = lang !== "ar";
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#fbe9dc", fontFamily: "Onest" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640, padding: 64 }}>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: 2, color: "#0d1717" }}>SOLENNE</div>
          {words ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 84, fontWeight: 200, lineHeight: 0.95, letterSpacing: -4, color: "#0d1717" }}>
                {t.meta.tagline}
              </div>
              <div style={{ marginTop: 28, fontSize: 26, color: "#6b6b6b" }}>{t.meta.ogLead}</div>
            </div>
          ) : (
            <div style={{ fontSize: 220, fontWeight: 200, lineHeight: 0.9, letterSpacing: -12, color: "#0d1717" }}>
              {brandStat.value}
            </div>
          )}
          <div style={{ display: "flex", width: 120, height: 4, background: "#f15730", borderRadius: 4 }} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
        <img src={photo} alt="" width={560} height={630} style={{ objectFit: "cover" }} />
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
