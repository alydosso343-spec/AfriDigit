import type { Metadata } from "next";
import { Suspense } from "react";
import { ShoppingBag } from "lucide-react";
import { getSiteCurrency } from "@/lib/env";
import { ProductGridSkeleton } from "@/components/states";
import { ProductList } from "@/components/product-list";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Produits",
  description:
    "Le catalogue complet d'AfriDigit : ebooks, formations et outils numériques, chaque produit ouvrant la page de paiement sécurisée Chariow.",
};

export default function ProductsPage() {
  const currency = getSiteCurrency();

  return (
    <section aria-labelledby="catalogue-titre">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-9 flex flex-col gap-3 text-center sm:mb-10">
          <span className="glass mx-auto inline-flex items-center gap-2 self-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
            <ShoppingBag size={13} aria-hidden />
            Catalogue complet
          </span>
          <h1 id="catalogue-titre" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Tous les produits digitaux
          </h1>
          <p className="mx-auto max-w-xl text-slate-600">
            La vitrine complète : image, prix et description pour chaque
            produit. L&apos;achat s&apos;effectue toujours sur la page
            officielle Chariow du produit.
          </p>
        </div>

        <Suspense fallback={<ProductGridSkeleton count={9} />}>
          <ProductList currency={currency} />
        </Suspense>

        <div className="mt-12 text-center">
          <Link href="/comment-ca-marche" className="btn btn-outline text-sm">
            Comment se passe l&apos;achat ? La démarche est expliquée ici
            <span aria-hidden="true"> →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
