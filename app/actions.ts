"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getAdminAccessCode,
  getAdminEmail,
  getAdminSessionSecret,
} from "@/lib/env";
import { clearAdminSession, getAdminSession, setAdminSession } from "@/lib/admin-guard";
import { constantTimeEquals } from "@/lib/admin-session";
import {
  productSchema,
  validateImageFile,
  isValidHttpsUrl,
  zodToFieldErrors,
} from "@/lib/validation";
import {
  createProductRecord,
  deleteProductRecord,
  getProductById,
  removeStoredImage,
  reorderProductRecords,
  saveProductImage,
  updateProductRecord,
  type Product,
  type ProductWriteValues,
} from "@/lib/products";

/** Résultat d'un appel serveur consommé par l'interface de gestion. */
export type MutationResult =
  | { ok: true; message: string; product?: Product }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

export type ConfirmResult = { ok: boolean; message?: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ------------------------------------------------------------------ */
/* Authentification (adresse + code d'accès, vérifiés côté serveur)    */
/* ------------------------------------------------------------------ */

export type LoginState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: { email?: string; code?: string };
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Limitation des tentatives : 5 connexions ratées / 10 min / adresse. */
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(email: string): boolean {
  const entry = loginAttempts.get(email);
  if (!entry) return false;
  if (entry.resetAt <= Date.now()) {
    loginAttempts.delete(email);
    return false;
  }
  return entry.count >= LOGIN_MAX_ATTEMPTS;
}

function registerFailedAttempt(email: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(email);
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(email, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

function clearFailedAttempts(email: string): void {
  loginAttempts.delete(email);
}

/**
 * Connexion : adresse e-mail + code d'accès, vérifiés intégralement côté
 * serveur. Comparaisons à temps constant, limitation des tentatives, puis
 * session signée (cookie httpOnly). Message d'erreur unique et volontairement
 * imprécis : aucun indice ne révèle l'espace protégé ni l'adresse autorisée.
 */
export async function signInAdmin(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "");

  // 1. Validation de forme (indices de saisie, sans révélation).
  const fieldErrors: LoginState["fieldErrors"] = {};
  if (!email) {
    fieldErrors.email = "L'adresse e-mail est obligatoire.";
  } else if (email.length > 160 || !EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Cette adresse e-mail n'est pas valide.";
  }
  if (!code) {
    fieldErrors.code = "Le code d'accès est obligatoire.";
  } else if (code.length < 4) {
    fieldErrors.code = "Le code d'accès doit contenir au moins 4 caractères.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors };
  }

  // 2. Configuration.
  const adminEmail = getAdminEmail();
  const accessCode = getAdminAccessCode();
  const sessionSecret = getAdminSessionSecret();
  if (!accessCode || !sessionSecret) {
    return {
      status: "error",
      message: "Indisponible pour l'instant. Revenez plus tard.",
    };
  }

  // 3. Limitation des tentatives (clé : adresse soumise).
  if (isRateLimited(email)) {
    return {
      status: "error",
      message: "Trop de tentatives. Réessayez dans une dizaine de minutes.",
    };
  }

  // 4. Vérification réelle — chaque champ est comparé à temps constant.
  const emailAuthorized = constantTimeEquals(email, adminEmail);
  const codeValid = constantTimeEquals(code, accessCode);

  if (!emailAuthorized || !codeValid) {
    registerFailedAttempt(email);
    return {
      status: "error",
      message: "Identifiants incorrects.",
    };
  }

  // 5. Session signée, puis redirection vers l'espace protégé.
  clearFailedAttempts(email);
  await setAdminSession(adminEmail);
  redirect("/admin");
}

/** Déconnecte la session en cours et renvoie sur la boutique publique. */
export async function signOutAdmin(): Promise<void> {
  await clearAdminSession();
  revalidatePath("/", "layout");
  redirect("/");
}

/* ------------------------------------------------------------------ */
/* Garde partagé — session valide avant toute écriture                 */
/* ------------------------------------------------------------------ */

type Guard = { ok: false; message: string } | { ok: true };

/**
 * Blocage des écritures : session signée valide obligatoire. Le backend
 * (local ou Supabase service_role) n'est touché qu'après ce contrôle.
 */
async function guardAdminWrite(): Promise<Guard> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, message: "Session expirée ou accès non autorisé. Reconnectez-vous." };
  }
  return { ok: true };
}

function refreshViews() {
  revalidatePath("/");
  revalidatePath("/produits");
  revalidatePath("/comment-ca-marche");
  revalidatePath("/admin");
}

/* ------------------------------------------------------------------ */
/* Gestion des images                                                  */
/* ------------------------------------------------------------------ */

type ImageResolution =
  | { mode: "keep" } // ne touche pas à image_url
  | { mode: "remove" } // image_url = null
  | { mode: "set"; url: string | null } // définit image_url
  ;

/**
 * Un chemin interne (image déjà hébergée par le site : /uploads/… en mode
 * local, URL du bucket en mode Supabase) n'est pas un lien externe à
 * valider : seul https:// fait foi pour un NOUVEAU lien collé.
 */
function isStoredImagePath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//");
}

/**
 * Décide de l'image finale du produit à partir du formulaire :
 *  1. fichier téléversé (prioritaire) ;
 *  2. lien d'image https collé ;
 *  3. champ modifié et laissé vide → suppression de l'image ;
 *  4. champ intact → conservée.
 * Les erreurs de validation sont ajoutées dans `fieldErrors`.
 */
async function resolveProductImage(
  formData: FormData,
  fieldErrors: Record<string, string>
): Promise<ImageResolution> {
  const file = formData.get("image_file");
  const urlInput = String(formData.get("image_url") ?? "").trim();
  const isDirty = String(formData.get("image_dirty") ?? "") === "1";

  if (file instanceof File && file.size > 0) {
    const fileError = validateImageFile(file);
    if (fileError) {
      fieldErrors.image_file = fileError;
      return { mode: "keep" };
    }
    try {
      const url = await saveProductImage(file);
      return { mode: "set", url };
    } catch (exception) {
      console.error("[AfriDigit] Téléversement impossible :", exception);
      fieldErrors.image_file =
        "Le téléversement de l'image a échoué. Réessayez.";
      return { mode: "keep" };
    }
  }

  if (urlInput) {
    // Chemin interne déjà hébergé par le site (ex. /uploads/… en mode local) :
    // le formulaire d'édition renvoie l'image actuelle — on la conserve
    // tel quel, sans validation https réservée aux liens externes.
    if (isStoredImagePath(urlInput)) {
      return { mode: "keep" };
    }
    if (!isValidHttpsUrl(urlInput)) {
      fieldErrors.image_url = "Le lien de l'image doit être une URL valide commençant par https://.";
      return { mode: "keep" };
    }
    return { mode: "set", url: urlInput };
  }

  return { mode: isDirty ? "remove" : "keep" };
}

/* ------------------------------------------------------------------ */
/* CRUD produits                                                       */
/* ------------------------------------------------------------------ */

export async function createProduct(formData: FormData): Promise<MutationResult> {
  const guard = await guardAdminWrite();
  if (!guard.ok) return { ok: false, message: guard.message };

  const fieldErrors: Record<string, string> = {};
  try {
    const parsed = productSchema.safeParse({
      name: formData.get("name") ?? "",
      description: formData.get("description") ?? "",
      price: formData.get("price") ?? "",
      chariow_url: formData.get("chariow_url") ?? "",
    });
    if (!parsed.success) {
      return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
    }

    const image = await resolveProductImage(formData, fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, fieldErrors };
    }

    const values: ProductWriteValues = {
      ...parsed.data,
      image_url: image.mode === "set" ? image.url : null,
    };
    const product = await createProductRecord(values);

    refreshViews();
    return {
      ok: true,
      message: "« " + product.name + " » est en ligne : il apparaît sur la boutique.",
      product,
    };
  } catch (exception) {
    console.error("[AfriDigit] Enregistrement impossible :", exception);
    return { ok: false, message: "L'enregistrement du produit a échoué. Réessayez." };
  }
}

export async function updateProduct(formData: FormData): Promise<MutationResult> {
  const guard = await guardAdminWrite();
  if (!guard.ok) return { ok: false, message: guard.message };

  const fieldErrors: Record<string, string> = {};
  try {
    const id = String(formData.get("id") ?? "").trim();
    if (!UUID_PATTERN.test(id)) {
      return { ok: false, message: "Produit introuvable (identifiant invalide)." };
    }

    const parsed = productSchema.safeParse({
      name: formData.get("name") ?? "",
      description: formData.get("description") ?? "",
      price: formData.get("price") ?? "",
      chariow_url: formData.get("chariow_url") ?? "",
    });
    if (!parsed.success) {
      return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
    }

    const image = await resolveProductImage(formData, fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, fieldErrors };
    }

    // L'état actuel du produit sert de référence (et pour nettoyer l'ancienne image).
    const previous = await getProductById(id);
    if (!previous) {
      return { ok: false, message: "Produit introuvable (il a peut-être déjà été supprimé)." };
    }

    const patch: Record<string, unknown> = { ...parsed.data };
    if (image.mode === "set") patch.image_url = image.url;
    if (image.mode === "remove") patch.image_url = null;

    const product = await updateProductRecord(id, patch);
    if (!product) {
      return { ok: false, message: "Produit introuvable (il a peut-être déjà été supprimé)." };
    }

    // Nettoyage de l'ancienne image hébergée si elle a été remplacée.
    if (image.mode !== "keep" && previous.image_url && previous.image_url !== product.image_url) {
      await removeStoredImage(previous.image_url);
    }

    refreshViews();
    return {
      ok: true,
      message: "Les modifications de « " + product.name + " » sont en ligne.",
      product,
    };
  } catch (exception) {
    console.error("[AfriDigit] Mise à jour impossible :", exception);
    return { ok: false, message: "La mise à jour du produit a échoué. Réessayez." };
  }
}

export async function deleteProduct(productId: string): Promise<MutationResult> {
  const guard = await guardAdminWrite();
  if (!guard.ok) return { ok: false, message: guard.message };

  try {
    const id = String(productId ?? "").trim();
    if (!UUID_PATTERN.test(id)) {
      return { ok: false, message: "Produit introuvable (identifiant invalide)." };
    }

    const previous = await getProductById(id);
    if (!previous) {
      return { ok: false, message: "Produit introuvable (il a peut-être déjà été supprimé)." };
    }

    await deleteProductRecord(id);
    await removeStoredImage(previous.image_url);

    refreshViews();
    return { ok: true, message: "Le produit « " + previous.name + " » a été supprimé." };
  } catch (exception) {
    console.error("[AfriDigit] Suppression impossible :", exception);
    return { ok: false, message: "La suppression a échoué. Réessayez." };
  }
}

/**
 * Enregistre le nouvel ordre de présentation des produits.
 * @param orderedIds tableau des identifiants dans l'ordre d'affichage souhaité.
 */
export async function reorderProducts(orderedIds: string[]): Promise<ConfirmResult> {
  const guard = await guardAdminWrite();
  if (!guard.ok) return { ok: false, message: guard.message };

  try {
    if (
      !Array.isArray(orderedIds) ||
      orderedIds.length === 0 ||
      orderedIds.length > 200 ||
      !orderedIds.every((id) => typeof id === "string" && UUID_PATTERN.test(id))
    ) {
      return { ok: false, message: "Le nouvel ordre envoyé n'est pas valide." };
    }

    await reorderProductRecords(orderedIds);

    refreshViews();
    return { ok: true, message: "L'ordre des produits a été mis à jour." };
  } catch (exception) {
    console.error("[AfriDigit] Réorganisation impossible :", exception);
    return { ok: false, message: "L'ordre n'a pas pu être enregistré. Réessayez." };
  }
}
