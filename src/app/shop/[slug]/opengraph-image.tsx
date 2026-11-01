import { ImageResponse } from "next/og";
import { ogFonts, ogPhoto, ogSize } from "@/lib/og";
import { productPhotos } from "@/data/photos";
import { formatPrice, getProduct, products } from "@/data/products";

export const alt = "Solenne product";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug) ?? products[0];
  const photo = await ogPhoto(productPhotos[p.slug][0].src);
  const lead = p.actives[0];
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff", fontFamily: "Onest" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
        <img src={photo} alt="" width={520} height={630} style={{ objectFit: "cover" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: 60 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#6b6b6b" }}>
            <span style={{ fontWeight: 500, letterSpacing: 2, color: "#0d1717" }}>SOLENNE</span>
            <span>{p.kind}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 200, fontWeight: 200, lineHeight: 0.9, letterSpacing: -10, color: "#0d1717" }}>
              {`${lead.percent}%`}
            </div>
            <div style={{ fontSize: 28, fontWeight: 500, color: "#f15730", marginTop: 8 }}>{lead.name}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 54, fontWeight: 200, letterSpacing: -2, color: "#0d1717" }}>{p.name}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 24, color: "#6b6b6b" }}>
              <span>{p.tagline.length > 52 ? `${p.tagline.slice(0, 50)}…` : p.tagline}</span>
              <span style={{ color: "#0d1717" }}>{`from ${formatPrice(p.variants[0].price)}`}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
