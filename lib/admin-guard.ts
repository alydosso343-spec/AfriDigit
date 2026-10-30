import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/admin-session";
import { getAdminEmail, getAdminSessionSecret } from "@/lib/env";

export type AdminSession = { email: string };

/**
 * Lit la session administrateur depuis le cookie signé.
 * La signature est vérifiée côté serveur — le cookie ne peut pas être
 * forgé depuis le navigateur (secret uniquement connu du serveur).
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const secret = getAdminSessionSecret();
  if (!secret) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const email = await verifyAdminSessionToken(secret, token);
  if (!email || email !== getAdminEmail()) {
    return null;
  }
  return { email };
}

/**
 * Crée la session (à appeler uniquement dans une Server Action :
 * l'écriture de cookie y est autorisée).
 */
export async function setAdminSession(email: string): Promise<void> {
  const secret = getAdminSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET manquant : impossible de créer la session.");
  }

  const token = await createAdminSessionToken(secret, email.toLowerCase());
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** Supprime la session (déconnexion). */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Garde de page : redirige vers la connexion générique si aucune session
 * valide. La vraie clé d'accès reste la vérification serveur (signature +
 * adresse autorisée) — le front n'est qu'un habillage.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/connexion");
  }
  return session;
}
