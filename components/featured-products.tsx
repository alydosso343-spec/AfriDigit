import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { listProducts } from "@/lib/products";
import ProductCardView from "@/components/product-card-view";
import Reveal from "@/components/reveal";
import { ProductGridEmpty, ProductGridError } from "@/components/states";

const PRODUCT_COLUMNS_LIMIT = 3;

/**
 * Produits phares de la page d'accueil : les 3 premiers de la vitrine.
 * Chargée sous <Suspense> depuis la page. En cas de boutique vide ou
 * non configurée, l'état prévu s'affiche (aucun bruit console).
 */
export async function FeaturedProducts({ currency }: { currency: string }) {
  const result = await listProducts();

  if (!result.ok) {
    if (result.error === "db") {
      return <ProductGridError />;
    }
    return <ProductGridEmpty />;
  }

  if (result.products.length === 0) {
    return <ProductGridEmpty />;
  }

  const featured = result.products.slice(0, PRODUCT_COLUMNS_LIMIT);

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((product, index) => (
          <Reveal key={product.id} delay={index * 90}>
            <ProductCardView
              name={product.name}
              description={product.description}
              priceLabel={formatPrice(product.price, currency)}
              imageUrl={product.image_url}
              href={product.chariow_url}
            />
          </Reveal>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/produits" className="btn btn-blue px-5 py-3 text-sm">
          Voir toute la boutique
          <ArrowRight size={17} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
