import type { Metadata } from "next";
import Link from "@/i18n/Link";
import { getI18n } from "@/i18n/server";
import { alternates } from "@/i18n/seo";

export async function generateMetadata(props: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { locale, t } = await getI18n(props.params);
  return { title: t.about.metaTitle, description: t.about.metaDescription, alternates: alternates(locale, "/about") };
}

// Placeholder story — replace with the client's own once they send it.
export default async function AboutPage(props: PageProps<"/[lang]/about">) {
  const { t } = await getI18n(props.params);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-12">
      <p className="label text-smoke">{t.about.eyebrow}</p>
      <h1 className="mt-4 max-w-3xl display text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.05] ">{t.about.title}</h1>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-smoke">{t.about.body}</p>

      <div className="mt-20 grid gap-10 border-t border-mist pt-12 md:grid-cols-3">
        {t.about.principles.map((p) => (
          <div key={p.title}>
            <h2 className="text-[23px] font-light tracking-[-0.03em]">{p.title}</h2>
            <p className="mt-3 leading-relaxed text-smoke">{p.body}</p>
          </div>
        ))}
      </div>

      <Link href="/shop" className="mt-16 inline-block btn">
        {t.about.cta}
      </Link>
    </div>
  );
}
