import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { getAdminSession } from "@/lib/admin-guard";

/**
 * Coquille du site public (route group `(public)`) : en-tête avec
 * navigation, contenu, pied de page. La session admin est lue côté
 * serveur pour adapter les accès (Connexion ↔ Espace admin) au rendu.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  const isAdmin = session !== null;

  return (
    <>
      <SiteHeader isAdmin={isAdmin} />
      <main id="contenu">{children}</main>
      <SiteFooter />
    </>
  );
}
