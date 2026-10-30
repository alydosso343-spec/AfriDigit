import { z } from "zod";

/** Limites appliquées aux champs de formulaire. */
export const LIMITS = {
  name: { min: 2, max: 80 },
  description: { min: 5, max: 300 },
  price: { max: 999_999_999 },
  imageSize: 4 * 1024 * 1024, // 4 Mo
} as const;

const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

/** Vérifie qu'une chaîne est une URL valide en HTTPS. */
export function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
}

/** Convertit un prix FR (« 12,5 ») en nombre. */
const parsePrice = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() !== ""
      ? Number(value.replace(/\s/g, "").replace(",", "."))
      : value,
  z
    .number({ message: "Le prix est obligatoire et doit être un nombre." })
    .min(0, "Le prix doit être supérieur ou égal à 0.")
    .max(LIMITS.price.max, "Le prix dépasse la limite autorisée (999 999 999).")
    .refine(
      (n) => Number.isFinite(n) && Math.round(n * 100) === n * 100,
      "Le prix ne peut pas avoir plus de 2 décimales."
    )
);

/**
 * Schéma d'un produit tel qu'il peut provenir du formulaire d'administration.
 */
export const productSchema = z.object({
  name: z
    .string({ message: "Le nom du produit est obligatoire." })
    .trim()
    .min(LIMITS.name.min, `Le nom doit contenir au moins ${LIMITS.name.min} caractères.`)
    .max(LIMITS.name.max, `Le nom ne peut pas dépasser ${LIMITS.name.max} caractères.`),
  description: z
    .string({ message: "La description est obligatoire." })
    .trim()
    .min(
      LIMITS.description.min,
      `La description doit contenir au moins ${LIMITS.description.min} caractères.`
    )
    .max(
      LIMITS.description.max,
      `La description ne peut pas dépasser ${LIMITS.description.max} caractères.`
    ),
  price: parsePrice,
  chariow_url: z
    .string({ message: "Le lien Chariow est obligatoire." })
    .trim()
    .min(1, "Le lien Chariow est obligatoire.")
    .max(600, "Le lien Chariow est trop long.")
    .refine(
      isValidHttpsUrl,
      "Le lien Chariow doit être une URL valide commençant par https:// (ex. https://chariow.com/mon-produit)."
    ),
});

export type ProductInput = z.infer<typeof productSchema>;

/**
 * Valide le fichier d'image sélectionné dans l'administration.
 * @returns un message d'erreur, ou `null` si le fichier est acceptable.
 */
export function validateImageFile(file: File): string | null {
  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return "Format d'image non pris en charge. Utilisez PNG, JPEG, WEBP, GIF ou AVIF.";
  }
  if (file.size === 0) {
    return "Le fichier est vide.";
  }
  if (file.size > LIMITS.imageSize) {
    return "L'image dépasse la taille maximum de 4 Mo.";
  }
  return null;
}

/** Convertit les erreurs Zod en erreurs par champ (premier message seulement). */
export function zodToFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

/** Extension de fichier correspondant à un type MIME image. */
export function extensionFromMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return "img";
  }
}
