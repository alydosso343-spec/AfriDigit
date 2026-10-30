import { formatPrice } from "@/lib/format";
import { listProducts } from "@/lib/products";
import ProductCardView from "@/components/product-card-view";
import Reveal from "@/components/reveal";
import {
  ProductGridEmpty,
  ProductGridError,
  ProductGridSkeleton,
} from "@/components/states";

/**
 * Grille des produits du site public, chargée depuis la base de données.
 * Affichée sous <Suspense> : le squelette apparaît en attendant la réponse.
 */
export async function ProductList({ currency }: { currency: string }) {
  const result = await listProducts();

  if (!result.ok) {
    const isConfig = result.error === "not_configured";
    return (
      <ProductGridError
        detail={
          isConfig
            ? undefined
            : result.message && process.env.NODE_ENV === "development"
              ? result.message
              : undefined
        }
      />
    );
  }

  if (result.products.length === 0) {
    return <ProductGridEmpty />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {result.products.map((product, index) => (
        <Reveal key={product.id} delay={(index % 3) * 90}>
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
  );
}

export { ProductGridSkeleton };
