import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "lenis/dist/lenis.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailModal from "@/components/EmailModal";
import Intro, { introScript } from "@/components/Intro";
import Cursor from "@/components/Cursor";
import SmoothScroll from "@/components/SmoothScroll";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const onest = Onest({ variable: "--font-onest", subsets: ["latin"], weight: ["200", "300", "400", "500", "600"] });

export const metadata: Metadata = {
  title: { default: "Solenne — Skincare you can see through", template: "%s · Solenne" },
  description: "Skincare in clear glass, with every active ingredient printed at its exact percentage.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${onest.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="flex min-h-svh flex-col">
        <Intro />
        <SmoothScroll />
        <Cursor />
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <EmailModal />
        </CartProvider>
      </body>
    </html>
  );
}
