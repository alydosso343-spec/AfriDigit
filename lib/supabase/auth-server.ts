import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Session Supabase côté serveur pour l'ESPACE CLIENT (visiteurs).
 *
 * Réutilise la clé publique *anon* : les mots de passe ne sont jamais
 * manipulés par ce site — Supabase Auth les hache et délivre des jetons
 * stockés dans des cookies du navigateur, lus ici à chaque requête.
 * Retourne `null` quand Supabase n'est pas encore configuré :
 * l'espace client est alors simplement indisponible.
 */

export type CustomerSession = {
  email: string;
  name: string;
};

/** Client Supabase connecté au stockage de cookies du rendu / des actions. */
export function createCookieSupabaseClient() {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }
  const store = cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) {
            store.set(name, value, options);
          }
        } catch {
          // Cookies en lecture seule pendant le rendu serveur : la
          // rotation s'effectue via les Server Actions. Comportement assumé.
        }
      },
    },
  });
}

/**
 * Renvoie le client connecté si Supabase Auth (espace client) est configuré.
 * `null` tant que les clés Supabase ne sont pas renseignées.
 */
export function getOptionalSupabaseAuth() {
  return createCookieSupabaseClient();
}

/** Session du visiteur connecté, ou `null` (aucune info sensible ici). */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  const supabase = createCookieSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    return null;
  }
  const name = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";
  return { email: user.email ?? "", name };
}
