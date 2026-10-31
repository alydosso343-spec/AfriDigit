import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { getAdminSession } from "@/lib/admin-guard";
import { getCustomerSession } from "@/lib/supabase/auth-server";

/**
 * Coquille du site public (route group `(public)`) : en-tête avec
 * navigation, contenu, pied de page. Les sessions admin et client sont
 * lues côté serveur pour adapter l'en-tête au rendu :
 *  - admin    → pastille discrète « Espace admin » ;
 *  - client   → « Bonjour {prénom} » (espace client) ;
 *  - visiteur → « S'inscrire » / « Connexion ».
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adminSession, customer] = await Promise.all([
    getAdminSession(),
    getCustomerSession(),
  ]);

  return (
    <>
      <SiteHeader
        isAdmin={adminSession !== null}
        customerName={customer?.name || undefined}
      />
      <main id="contenu">{children}</main>
      <SiteFooter />
    </>
  );
}
