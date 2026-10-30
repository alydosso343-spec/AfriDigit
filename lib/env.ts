/**
 * Configuration centrale du site, lue depuis les variables d'environnement.
 * Aucun secret n'est stocké dans le code : tout passe par l'environnement.
 */

const DEFAULT_CURRENCY = "XOF";

/**
 * Adresse autorisée à accéder à l'espace privé (variable ADMIN_EMAIL).
 * Aucune valeur par défaut : si la variable est absente, la connexion
 * n'aboutit pas — l'adresse n'apparaît nulle part côté public.
 */
export function getAdminEmail(): string {
  const fromEnv = process.env.ADMIN_EMAIL?.trim();
  return (fromEnv || "").toLowerCase();
}

/** Code d'accès à l'administration (variable ADMIN_ACCESS_CODE). */
export function getAdminAccessCode(): string | null {
  const fromEnv = process.env.ADMIN_ACCESS_CODE?.trim();
  return fromEnv || null;
}

/**
 * Secret utilisé pour signer les sessions d'administration
 * (variable ADMIN_SESSION_SECRET — une chaîne aléatoire longue).
 */
export function getAdminSessionSecret(): string | null {
  const fromEnv = process.env.ADMIN_SESSION_SECRET?.trim();
  return fromEnv || null;
}

/** Devise affichée à côté des prix (défaut : XOF). */
export function getSiteCurrency(): string {
  const fromEnv = process.env.CURRENCY?.trim().toUpperCase();
  return fromEnv || DEFAULT_CURRENCY;
}

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

/**
 * Identifiants Supabase configurés (clé publique *anon*), ou `null` si absents.
 * Silencieux : l'absence de configuration est un état assumé, l'interface
 * l'affiche elle-même — aucun avertissement polluant la console.
 */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}

export type SupabaseServiceEnv = {
  url: string;
  serviceKey: string;
};

/**
 * Identifiants Supabase nécessaires aux ÉCRITURES d'administration
 * (clé *service_role*, jamais exposée au navigateur), ou `null` si absents.
 */
export function getSupabaseServiceEnv(): SupabaseServiceEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    return null;
  }
  return { url, serviceKey };
}

/** URL publique du site (données OpenGraph, redirections). */
export function getSiteUrl(requestOrigin?: string): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    requestOrigin ||
    ""
  );
}
