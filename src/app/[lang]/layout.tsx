import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Onest } from "next/font/google";
import "lenis/dist/lenis.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailModal from "@/components/EmailModal";
import Intro, { introScript } from "@/components/Intro";
import Cursor from "@/components/Cursor";
import Atmosphere from "@/components/Atmosphere";
import PauseOffscreen from "@/components/PauseOffscreen";
import SmoothScroll from "@/components/SmoothScroll";
import { CartProvider } from "@/lib/cart";
import { themeScript } from "@/lib/themeScript";
import { BRAND, SITE_URL } from "@/lib/site";
import { I18nProvider } from "@/i18n/client";
import { localeInfo, locales } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { alternates, ogLocale } from "@/i18n/seo";
import "../globals.css";

const onest = Onest({ variable: "--font-onest", subsets: ["latin"], weight: ["200", "300", "400", "500", "600"] });
// Arabic companion to Onest: same thin-to-medium range, so headings keep their whisper weight.
const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
});

// Only the three languages exist: getI18n 404s anything else.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { locale, t } = await getI18n(props.params);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${BRAND} — ${t.meta.tagline}`, template: `%s · ${BRAND}` },
    description: t.meta.description,
    applicationName: BRAND,
    alternates: alternates(locale, "/"),
    openGraph: { type: "website", siteName: BRAND, url: `/${locale}`, ...ogLocale(locale) },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#120d0b" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { locale, t } = await getI18n(params);
  // Brand identity for search engines. Add the client's social profiles to sameAs at launch.
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE_URL,
    description: t.meta.description,
  };
  return (
    <html
      lang={locale}
      dir={localeInfo[locale].dir}
      className={`${onest.variable} ${arabic.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + introScript }} />
      </head>
      <body className="flex min-h-svh flex-col">
        <a href="#main" className="skip-link">
          {t.common.skip}
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <I18nProvider locale={locale} dict={t}>
          <Intro />
          <SmoothScroll />
          <Cursor />
          <Atmosphere />
          <PauseOffscreen />
          <CartProvider>
            <Header />
            <main id="main" tabIndex={-1} className="relative z-[1] flex-1 outline-none">{children}</main>
            <Footer />
            <EmailModal />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
