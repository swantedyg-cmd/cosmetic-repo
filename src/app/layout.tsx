import type { Metadata } from "next";
import { Onest } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailModal from "@/components/EmailModal";
import ViewLayer from "@/components/ViewLayer";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const onest = Onest({ variable: "--font-onest", subsets: ["latin"], weight: ["200", "300", "400", "500", "600"] });

export const metadata: Metadata = {
  title: { default: "Solenne — Skincare you can see through", template: "%s · Solenne" },
  description: "Skincare in clear glass, with every active ingredient printed at its exact percentage.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${onest.variable} antialiased`}>
      <body className="flex min-h-svh flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <EmailModal />
          <ViewLayer />
        </CartProvider>
      </body>
    </html>
  );
}
