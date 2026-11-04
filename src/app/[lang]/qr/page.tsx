import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "@/i18n/Link";
import PrintButton from "@/components/PrintButton";
import { products } from "@/data/products";
import { qrSvg, scanUrl } from "@/lib/qr";
import { getI18n } from "@/i18n/server";

// The brand's QR sheet: one print-ready code per formula, for packaging and point of sale.
// Each code opens /s/<slug>, where the bottle builds itself in 3D.

type Props = PageProps<"/[lang]/qr">;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { t } = await getI18n(props.params);
  return { title: t.qr.metaTitle, robots: { index: false, follow: false } };
}

export default function QrPage(props: Props) {
  return (
    <Suspense fallback={<div className="h-svh" />}>
      <Sheet params={props.params} />
    </Suspense>
  );
}

async function Sheet({ params }: { params: Props["params"] }) {
  const i = await getI18n(params);
  const { t } = i;
  return (
    <div className="qr-sheet mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-12">
      <div className="max-w-2xl">
        <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-none tracking-tight">{t.qr.title}</h1>
        <p className="mt-5 text-lg text-smoke">{t.qr.intro}</p>
        <p className="no-print mt-3 text-sm text-smoke">{t.qr.tip}</p>
        <div className="no-print mt-8">
          <PrintButton label={t.qr.print} />
        </div>
      </div>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((base) => {
          const p = i.product(base);
          const url = scanUrl(p.slug);
          const svg = qrSvg(url);
          return (
            <li key={p.slug} className="qr-card flex flex-col rounded-[15px] border border-mist bg-white p-6 text-[#0d1717]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label text-[#6b6460]">{p.kind}</p>
                  <h2 className="mt-1 text-xl font-light tracking-tight">{p.name}</h2>
                </div>
                <span className="mt-1 size-3 shrink-0 rounded-full" style={{ background: p.color }} aria-hidden />
              </div>
              {/* The code is always ink on white, whatever the theme, so it scans off a screen too. */}
              <div
                role="img"
                aria-label={`QR · ${p.name}`}
                className="mx-auto mt-5 w-full max-w-[15rem] [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <p dir="ltr" className="numeric mt-4 truncate text-center text-xs text-[#6b6460]">
                {url.replace(/^https?:\/\//, "")}
              </p>
              <div className="no-print mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-mist pt-4 text-sm">
                <a
                  href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
                  download={`solenne-qr-${p.slug}.svg`}
                  className="underline underline-offset-4 hover:text-ember"
                >
                  {t.qr.download}
                </a>
                <Link href={`/s/${p.slug}`} className="text-[#6b6460] underline-offset-4 hover:text-ember hover:underline">
                  {t.qr.try}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
