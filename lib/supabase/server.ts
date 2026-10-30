import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, getSupabaseServiceEnv } from "@/lib/env";

/**
 * Deux clients Supabase distincts selon le besoin :
 *  - PUBLIC (clé *anon*) : lecture des produits uniquement. L'absence de
 *    configuration est un état assumé → `null`, sans exception ni bruit.
 *  - SERVICE (clé *service_role*) : écritures administrateur. Toujours
 *    derrière la garde de session (`lib/admin-guard`).
 * Aucun des deux ne manipule de cookies : plus de session Supabase côté
 * site (l'authentification admin est gérée par la session signée).
 */

/** Client de lecture publique, ou `null` quand Supabase n'est pas configuré. */
export function getPublicSupabaseClient() {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Client d'écriture (service_role) — à utiliser UNIQUEMENT après
 * vérification de la session administrateur. Lève si non configuré.
 */
export function createServiceClient() {
  const env = getSupabaseServiceEnv();
  if (!env) {
    throw new Error(
      "Supabase non configuré pour l'administration "
        + "(SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL absents)."
    );
  }
  return createClient(env.url, env.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
