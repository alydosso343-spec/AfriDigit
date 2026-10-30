import { NextResponse, type NextRequest } from "next/server";
import { getAdminEmail, getAdminSessionSecret } from "@/lib/env";
import { SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";

/**
 * Garde d'accès côté serveur.
 *
 *  - la page /connexion est volontairement générique : elle ne révèle
 *    rien sur la zone protégée ;
 *  - toute tentative d'accès à /admin/* sans session signée valide
 *    (adresse autorisée) retourne discrètement sur /connexion ;
 *  - une personne déjà connectée qui ouvre /connexion est renvoyée
 *    vers son espace.
 *
 * Ce garde complète la vérification effectuée par le layout de
 * l'espace protégé et par chaque Server Action d'écriture.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = getAdminSessionSecret();

  const isConnexion = pathname === "/connexion";
  const looksAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!secret) {
    if (isConnexion) {
      return NextResponse.next();
    }
    if (looksAdmin) {
      const url = new URL("/connexion", request.url);
      url.searchParams.set("state", "not_configured");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const email = token ? await verifyAdminSessionToken(secret, token) : null;
  const isAuthorized = email !== null && email === getAdminEmail();

  if (isConnexion && isAuthorized) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (looksAdmin && !isAuthorized) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/connexion"],
};
