import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ScanReveal from "@/components/ScanReveal";
import { getProduct, products } from "@/data/products";
import { qrModules, scanUrl } from "@/lib/qr";
import { getI18n } from "@/i18n/server";

// Landing page for the QR code printed on each product. Printed codes encode /s/<slug>;
// the proxy adds the scanner's language. Not indexed: the product page is the canonical one.

type Props = PageProps<"/[lang]/s/[slug]">;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const i = await getI18n(props.params);
  const { slug } = await props.params;
  const product = i.bySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline,
    robots: { index: false, follow: true },
    alternates: { canonical: i.href(`/shop/${slug}`) },
  };
}

export default function ScanPage(props: Props) {
  return (
    <Suspense fallback={<div className="h-svh" />}>
      <Scan params={props.params} />
    </Suspense>
  );
}

async function Scan({ params }: { params: Props["params"] }) {
  const { slug } = await params;
  await getI18n(params);
  const product = getProduct(slug);
  if (!product) notFound();
  // The scene redraws the very code that was scanned.
  return <ScanReveal product={product} modules={qrModules(scanUrl(slug))} />;
}
