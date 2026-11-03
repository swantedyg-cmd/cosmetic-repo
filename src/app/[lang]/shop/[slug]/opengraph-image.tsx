import { ImageResponse } from "next/og";
import { ogFonts, ogPhoto, ogSize } from "@/lib/og";
import { productPhotos } from "@/data/photos";
import { getProduct, products } from "@/data/products";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { formatPrice } from "@/i18n/format";
import { localizeProduct } from "@/i18n/localize";

export const alt = "Solenne";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  // The card renderer can't shape Arabic, so Arabic cards keep the product's Latin name and drop the prose.
  const words = locale !== "ar";
  const base = getProduct(slug) ?? products[0];
  const p = words ? localizeProduct(base, getDictionary(locale)) : base;
  const photo = await ogPhoto(productPhotos[p.slug][0].src);
  const lead = p.actives[0];
  const from = getDictionary(locale).common.from;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff", fontFamily: "Onest" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
        <img src={photo} alt="" width={520} height={630} style={{ objectFit: "cover" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: 60 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#6b6b6b" }}>
            <span style={{ fontWeight: 500, letterSpacing: 2, color: "#0d1717" }}>SOLENNE</span>
            {words && <span>{p.kind}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 200, fontWeight: 200, lineHeight: 0.9, letterSpacing: -10, color: "#0d1717" }}>
              {`${lead.percent}%`}
            </div>
            {words && <div style={{ fontSize: 28, fontWeight: 500, color: "#f15730", marginTop: 8 }}>{lead.name}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 54, fontWeight: 200, letterSpacing: -2, color: "#0d1717" }}>{p.name}</div>
            {words && <div style={{ display: "flex", marginTop: 10, fontSize: 24, color: "#6b6b6b" }}>{p.tagline}</div>}
            <div style={{ display: "flex", marginTop: 14, fontSize: 24, color: "#0d1717" }}>
              {words ? from.replace("{price}", formatPrice(locale, p.variants[0].price)) : `€${p.variants[0].price}`}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
