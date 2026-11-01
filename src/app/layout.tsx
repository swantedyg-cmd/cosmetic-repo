import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import "lenis/dist/lenis.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailModal from "@/components/EmailModal";
import Intro, { introScript } from "@/components/Intro";
import Cursor from "@/components/Cursor";
import Atmosphere from "@/components/Atmosphere";
import SmoothScroll from "@/components/SmoothScroll";
import { CartProvider } from "@/lib/cart";
import { themeScript } from "@/lib/themeScript";
import { BRAND, DESCRIPTION, SITE_URL, TAGLINE } from "@/lib/site";
import "./globals.css";

const onest = Onest({ variable: "--font-onest", subsets: ["latin"], weight: ["200", "300", "400", "500", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND} — ${TAGLINE}`, template: `%s · ${BRAND}` },
  description: DESCRIPTION,
  applicationName: BRAND,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: BRAND, locale: "en_GB", url: "/" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#120d0b" },
  ],
};

// Brand identity for search engines. Add the client's social profiles to sameAs at launch.
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND,
  url: SITE_URL,
  description: DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${onest.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + introScript }} />
      </head>
      <body className="flex min-h-svh flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <Intro />
        <SmoothScroll />
        <Cursor />
        <Atmosphere />
        <CartProvider>
          <Header />
          <main id="main" tabIndex={-1} className="relative z-[1] flex-1 outline-none">{children}</main>
          <Footer />
          <EmailModal />
        </CartProvider>
      </body>
    </html>
  );
}
