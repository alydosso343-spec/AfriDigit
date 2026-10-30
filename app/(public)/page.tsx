import type { Metadata } from "next";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { getSiteCurrency } from "@/lib/env";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import { FeaturedProducts } from "@/components/featured-products";
import { ProductGridSkeleton } from "@/components/states";

export const metadata: Metadata = {
  title: undefined, // utilise le titre par défaut du layout racine
  description:
    "La vitrine AfriDigit : trois produits phares, la démarche en trois étapes, et le paiement sécurisé sur Chariow.",
};

export default function HomePage() {
  const currency = getSiteCurrency();

  return (
    <>
      <Hero />

      <section aria-labelledby="accroche-titre" className="mt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-9 flex flex-col gap-3 text-center sm:mb-10">
            <span className="glass mx-auto inline-flex items-center gap-2 self-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
              <Sparkles size={13} aria-hidden />
              La sélection AfriDigit
            </span>
            <h2 id="accroche-titre" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Nos produits phares
            </h2>
            <p className="mx-auto max-w-xl text-slate-600">
              Chaque vignette affiche le prix et la description du produit.
              Un clic sur « Acheter sur Chariow » vous amène directement sur
              la page de paiement sécurisée.
            </p>
          </div>

          <Suspense fallback={<ProductGridSkeleton count={3} />}>
            <FeaturedProducts currency={currency} />
          </Suspense>
        </div>
      </section>

      <div className="mt-20">
        <HowItWorks variant="compact" />
      </div>
    </>
  );
}
