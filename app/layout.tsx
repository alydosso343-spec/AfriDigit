import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/env";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "AfriDigit — Produits digitaux pensés pour l'Afrique",
    template: "%s | AfriDigit",
  },
  description:
    "AfriDigit présente une sélection de produits numériques de qualité : ebooks, formations et outils. Le paiement est effectué en toute sécurité sur Chariow.",
  keywords: ["AfriDigit", "produits digitaux", "ebooks", "formations", "Afrique", "Chariow"],
  openGraph: {
    title: "AfriDigit — Produits digitaux pensés pour l'Afrique",
    description:
      "Une boutique simple et rapide : choisissez un produit, payez en sécurité sur Chariow, récupérez votre achat.",
    siteName: "AfriDigit",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={outfit.variable}>
      <body className="min-h-dvh bg-white font-sans text-slate-900 antialiased">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg focus:ring-2 focus:ring-brand-600"
        >
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
