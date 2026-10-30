import { getSupabaseEnv } from "@/lib/env";
import * as localStore from "@/lib/store/local-store";
import * as supabaseStore from "@/lib/store/supabase-store";

/**
 * Façade unique pour TOUT le backend produits. Deux adaptateurs, un seul
 * contrat :
 *  - « supabase » dès que NEXT_PUBLIC_SUPABASE_URL + ANON_KEY existent
 *    (production, persistance managée) ;
 *  - « local » sinon : data/products.json + public/uploads — le site
 *    fonctionne immédiatement, sans aucune configuration.
 *
 * Les écritures utilisent la clé service_role quand Supabase est actif,
 * toujours derrière la garde de session (app/actions.ts).
 */

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  chariow_url: string;
  image_url: string | null;
  position: number;
  created_at: string;
  /** Renseigné par le backend local ; optionnel (Supabase le tient en base). */
  updated_at?: string;
};

export type ProductQueryResult =
  | { ok: true; products: Product[] }
  | { ok: false; error: "not_configured" | "db"; message?: string };

export type ProductWriteValues = {
  name: string;
  description: string;
  price: number;
  chariow_url: string;
  image_url: string | null;
};

export type ProductPatch = Partial<ProductWriteValues> & { position?: number };

export type BackendMode = "local" | "supabase";

/** Lecture : Supabase si configuré, sinon backend local. */
export function getBackendMode(): BackendMode {
  return getSupabaseEnv() ? "supabase" : "local";
}

/** Liste des produits triés pour l'affichage (état d'erreur assumé et silencieux côté UI). */
export async function listProducts(): Promise<ProductQueryResult> {
  if (getBackendMode() === "supabase") {
    try {
      return { ok: true, products: await supabaseStore.listSupabaseProducts() };
    } catch (exception) {
      console.error("[AfriDigit] Lecture des produits impossible :", exception);
      return {
        ok: false,
        error: "db",
        message: exception instanceof Error ? exception.message : undefined,
      };
    }
  }

  try {
    return { ok: true, products: await localStore.listLocalProducts() };
  } catch (exception) {
    console.error("[AfriDigit] Lecture des produits impossible :", exception);
    return {
      ok: false,
      error: "db",
      message: exception instanceof Error ? exception.message : undefined,
    };
  }
}

/** Renvoie un produit par identifiant (null s'il est absent). Throws backend error. */
export async function getProductById(id: string): Promise<Product | null> {
  if (getBackendMode() === "supabase") {
    return supabaseStore.getSupabaseProduct(id);
  }
  return localStore.getLocalProduct(id);
}

export async function createProductRecord(values: ProductWriteValues): Promise<Product> {
  if (getBackendMode() === "supabase") {
    return supabaseStore.createSupabaseProduct(values);
  }
  return localStore.createLocalProduct(values);
}

export async function updateProductRecord(
  id: string,
  patch: ProductPatch
): Promise<Product | null> {
  if (getBackendMode() === "supabase") {
    return supabaseStore.updateSupabaseProduct(id, patch);
  }
  return localStore.updateLocalProduct(id, patch);
}

export async function deleteProductRecord(id: string): Promise<Product | null> {
  if (getBackendMode() === "supabase") {
    return supabaseStore.deleteSupabaseProduct(id);
  }
  return localStore.deleteLocalProduct(id);
}

/** Applique l'ordre de présentation (identifiants dans le bon ordre). */
export async function reorderProductRecords(orderedIds: string[]): Promise<void> {
  if (getBackendMode() === "supabase") {
    return supabaseStore.reorderSupabaseProducts(orderedIds);
  }
  return localStore.reorderLocalProducts(orderedIds);
}

/** Enregistre une image produit (fichier validé en amont) et renvoie son URL. */
export async function saveProductImage(file: File): Promise<string> {
  if (getBackendMode() === "supabase") {
    return supabaseStore.saveSupabaseImage(file);
  }
  return localStore.saveLocalImage(file);
}

/** Supprime (au mieux) l'image d'un produit. */
export async function removeStoredImage(imageUrl: string | null): Promise<void> {
  if (getBackendMode() === "supabase") {
    return supabaseStore.removeSupabaseImage(imageUrl);
  }
  return localStore.removeLocalImage(imageUrl);
}
