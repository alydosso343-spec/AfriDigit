import { getSiteCurrency } from "@/lib/env";
import { listProducts } from "@/lib/products";
import ProductManager from "@/components/admin/product-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestion des produits",
};

/**
 * Tableau de bord administrateur : liste des produits avec réorganisation,
 * création, modification et suppression. L'accès est déjà garanti par le
 * layout du route group (requireAdminSession) et re-vérifié par chaque
 * Server Action de app/actions.ts.
 */
export default async function AdminProductsPage() {
  const result = await listProducts();

  return (
    <ProductManager
      initialProducts={result.ok ? result.products : []}
      initialLoadFailed={!result.ok}
      currency={getSiteCurrency()}
    />
  );
}
