import type { Product, ProductPatch, ProductWriteValues } from "@/lib/products";
import { getPublicSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import { extensionFromMime } from "@/lib/validation";

/**
 * Backend SUPABASE (utilisé automatiquement dès que les variables
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies) :
 *  - lecture via la clé publique anon (règles RLS en lecture seule) ;
 *  - écritures via la clé service_role (serveur uniquement, derrière la
 *    session admin signée).
 */

const PRODUCT_COLUMNS = "id, name, description, price, chariow_url, image_url, position, created_at";
const BUCKET = "product-images";

export async function listSupabaseProducts(): Promise<Product[]> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase non configuré.");
  }
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as Product[];
}

export async function getSupabaseProduct(id: string): Promise<Product | null> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase non configuré.");
  }
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? null) as Product | null;
}

export async function createSupabaseProduct(values: ProductWriteValues): Promise<Product> {
  const client = createServiceClient();
  const { count } = await client
    .from("products")
    .select("id", { count: "exact", head: true });
  const { data, error } = await client
    .from("products")
    .insert({ ...values, position: count ?? 0 })
    .select(PRODUCT_COLUMNS)
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Insertion sans réponse.");
  }
  return data as Product;
}

export async function updateSupabaseProduct(
  id: string,
  patch: ProductPatch
): Promise<Product | null> {
  const client = createServiceClient();
  const { data, error } = await client
    .from("products")
    .update(patch)
    .eq("id", id)
    .select(PRODUCT_COLUMNS)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? null) as Product | null;
}

export async function deleteSupabaseProduct(id: string): Promise<Product | null> {
  const client = createServiceClient();
  const { data, error } = await client
    .from("products")
    .delete()
    .eq("id", id)
    .select(PRODUCT_COLUMNS)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? null) as Product | null;
}

export async function reorderSupabaseProducts(orderedIds: string[]): Promise<void> {
  const client = createServiceClient();
  const payload = orderedIds.map((id, position) => ({ id, position }));
  const { error } = await client
    .from("products")
    .upsert(payload, { onConflict: "id" });
  if (error) {
    throw new Error(error.message);
  }
}

/** Téléverse l'image dans le bucket public et renvoie son URL. */
export async function saveSupabaseImage(file: File): Promise<string> {
  const client = createServiceClient();
  const pathName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extensionFromMime(file.type)}`;
  const buffer = await file.arrayBuffer();
  const { error } = await client.storage
    .from(BUCKET)
    .upload(pathName, buffer, { contentType: file.type, upsert: false });
  if (error) {
    throw new Error(`Bucket « ${BUCKET} » : ${error.message}`);
  }
  const { data } = client.storage.from(BUCKET).getPublicUrl(pathName);
  return data.publicUrl;
}

/** Supprime (au mieux) une image hébergée dans le bucket. */
export async function removeSupabaseImage(imageUrl: string | null): Promise<void> {
  if (!imageUrl) return;
  const marker = "/storage/v1/object/public/product-images/";
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;
  const pathName = imageUrl.slice(index + marker.length).split("?")[0];
  if (!pathName) return;
  try {
    const client = createServiceClient();
    const { error } = await client.storage.from(BUCKET).remove([pathName]);
    if (error) {
      console.error("[AfriDigit] Suppression d'image ignorée :", error.message);
    }
  } catch {
    // Image orpheline éventuelle : sans conséquence pour le site.
  }
}
