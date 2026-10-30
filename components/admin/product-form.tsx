"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ImageOff, LoaderCircle, Paperclip, Save } from "lucide-react";import ProductCardView from "@/components/product-card-view";
import { formatPrice } from "@/lib/format";
import { LIMITS, productSchema, zodToFieldErrors } from "@/lib/validation";
import { createProduct, updateProduct, type MutationResult } from "@/app/actions";
import type { Product } from "@/lib/products";

type ProductFormProps = {
  mode: "create" | "edit";
  product?: Product;
  currency: string;
  /** Appelé après un enregistrement réussi, avec le produit à jour. */
  onSaved: (product: Product, message: string) => void;
  onCancel: () => void;
};

/**
 * Formulaire de création / modification d'un produit, avec aperçu en
 * direct identique au rendu public. La validation passe par le schéma
 * Zod partagé ; elle est revérifiée sur le serveur.
 */
export default function ProductForm({
  mode,
  product,
  currency,
  onSaved,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState({
    name: product?.name ?? "",
    price: product ? String(product.price) : "",
    description: product?.description ?? "",
    chariowUrl: product?.chariow_url ?? "",
    imageUrl: product?.image_url ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [imageDirty, setImageDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Prévisualisation du fichier local (URL objet temporaire).
  // La création de l'URL se fait dans le handler du champ fichier ; ce
  // rendu d'effet ne fait que libérer l'URL précédente (aucun setState).
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(selected ? URL.createObjectURL(selected) : null);
    setFile(selected);
    if (errors.image_file) {
      setErrors((current) => {
        const next = { ...current };
        delete next.image_file;
        return next;
      });
    }
  };

  const priceNumber = Number(values.price.replace(/\s/g, "").replace(",", ".")) || 0;

  const previewImage =
    objectUrl ??
    (values.imageUrl.trim() !== ""
      ? values.imageUrl.trim()
      : imageDirty
        ? null
        : product?.image_url ?? null);

  const touchImage = () => setImageDirty(true);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setErrors({});
    setFormMessage(null);

    // Première validation locale (revérifiée côté serveur).
    const parsed = productSchema.safeParse({
      name: values.name,
      description: values.description,
      price: values.price,
      chariow_url: values.chariowUrl,
    });
    const localErrors = parsed.success ? {} : zodToFieldErrors(parsed.error);

    if (file) {
      if (file.size > LIMITS.imageSize) {
        localErrors.image_file = "L'image dépasse la taille maximum de 4 Mo.";
      } else if (!file.type.startsWith("image/")) {
        localErrors.image_file = "Fichier invalide : choisissez une image (PNG, JPEG, WEBP...).";
      }
    }
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      setFormMessage("Certains champs demandent votre attention ci-dessous.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("description", values.description);
      formData.set("price", values.price.trim());
      formData.set("chariow_url", values.chariowUrl.trim());
      formData.set("image_url", values.imageUrl.trim());
      formData.set(
        "image_dirty",
        imageDirty || file !== null ? "1" : "0"
      );
      if (file) formData.set("image_file", file);
      if (product) formData.set("id", product.id);

      let result: MutationResult;
      if (mode === "create") {
        result = await createProduct(formData);
      } else {
        result = await updateProduct(formData);
      }

      if (result.ok) {
        if (result.product) {
          onSaved(result.product, result.message);
        } else {
          setFormMessage(result.message ?? "Un problème est survenu. Merci de réessayer.");
        }
      } else if (result.fieldErrors) {
        setErrors(result.fieldErrors);
        setFormMessage("Certains champs demandent votre attention ci-dessous.");
      } else {
        setFormMessage(result.message ?? "Un problème est survenu. Merci de réessayer.");
      }
    } catch (exception) {
      console.error(exception);
      setFormMessage("Oups, une erreur imprévue est survenue. Merci de réessayer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
      {/* -------------------------- Formulaire -------------------------- */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Nom */}
        <div>
          <label htmlFor="pf-name" className="field-label">
            Nom du produit
          </label>
          <input
            id="pf-name"
            type="text"
            required
            maxLength={LIMITS.name.max}
            autoComplete="off"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "pf-name-error" : undefined}
            placeholder="Ex. Formation complète à l'IA"
            className="input"
          />
          {errors.name ? (
            <p id="pf-name-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
              {errors.name}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              {LIMITS.name.max - values.name.length} caractères restants
            </p>
          )}
        </div>

        {/* Prix */}
        <div>
          <label htmlFor="pf-price" className="field-label">
            Prix <span className="font-normal text-slate-400">— affiché en {currency}</span>
          </label>
          <div className="relative">
            <input
              id="pf-price"
              type="text"
              inputMode="decimal"
              required
              value={values.price}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  price: event.target.value.replace(/[^0-9., ]/g, ""),
                }))
              }
              onBlur={() => touchImage()}
              aria-invalid={errors.price ? true : undefined}
              aria-describedby={errors.price ? "pf-price-error" : undefined}
              placeholder="25 000"
              className="input pr-20"
            />
            <span aria-hidden="true" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              {currency}
            </span>
          </div>
          {errors.price ? (
            <p id="pf-price-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
              {errors.price}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              Sert uniquement à l'affichage : le paiement réel se fait sur Chariow.
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="pf-description" className="field-label">
              Description courte
            </label>
            <span className="text-xs text-slate-400">
              {values.description.length}/{LIMITS.description.max}
            </span>
          </div>
          <textarea
            id="pf-description"
            required
            rows={4}
            maxLength={LIMITS.description.max}
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value }))
            }
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? "pf-description-error" : undefined}
            placeholder="150 mots clairs et attractifs : de quoi convaincre vite, sans dépasser 300 caractères."
            className="input resize-none"
          />
          {errors.description ? (
            <p id="pf-description-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
              {errors.description}
            </p>
          ) : null}
        </div>

        {/* Lien Chariow */}
        <div>
          <label htmlFor="pf-chariow" className="field-label">
            Lien Chariow du produit
          </label>
          <input
            id="pf-chariow"
            type="url"
            required
            value={values.chariowUrl}
            onChange={(event) =>
              setValues((current) => ({ ...current, chariowUrl: event.target.value }))
            }
            aria-invalid={errors.chariow_url ? true : undefined}
            aria-describedby={"pf-chariow-hint " + (errors.chariow_url ? "pf-chariow-error" : "")}
            placeholder="https://chariow.com/mon-produit"
            className="input"
          />
          {errors.chariow_url ? (
            <p id="pf-chariow-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
              {errors.chariow_url}
            </p>
          ) : (
            <p id="pf-chariow-hint" className="mt-1 text-xs text-slate-400">
              Copiez l'adresse de la page du produit sur Chariow. Elle doit
              commencer par <span className="font-medium">https://</span> et le
              bouton d'achat pointera vers elle.
            </p>
          )}
        </div>

        {/* Image : fichier téléversé ou lien */}
        <fieldset className="rounded-2xl border border-slate-200/80 bg-white/50 p-3.5">
          <legend className="px-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
            Vignette du produit
          </legend>

          <label
            htmlFor="pf-image-file"
            className={
              "flex cursor-pointer items-center gap-2.5 rounded-xl border-2 border-dashed px-3.5 py-3 text-sm transition-colors " +
              (errors.image_file
                ? "border-red-300 text-red-700 hover:border-red-400"
                : "border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-700")
            }
          >
            <Paperclip size={17} aria-hidden />
            <span className="truncate">
              {file ? file.name : "Téléverser une image du produit (PNG, JPEG, WEBP…)"}
            </span>
            <input
              id="pf-image-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
          {errors.image_file ? (
            <p role="alert" className="mt-1 text-xs font-medium text-red-600">
              {errors.image_file}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-400">
              {file
                ? "Nouveau fichier choisi, il remplacera l'image actuelle après enregistrement."
                : mode === "edit"
                  ? "Laissez ce champ vide pour garder l'image actuelle du produit."
                  : null}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <span className="h-px flex-1 bg-slate-200" aria-hidden />
            <span className="text-xs font-medium text-slate-400">ou</span>
            <span className="h-px flex-1 bg-slate-200" aria-hidden />
          </div>

          <label htmlFor="pf-image-url" className="field-label mt-3">
            Lien direct d'une image <span className="font-normal text-slate-400">(https://)</span>
          </label>
          <input
            id="pf-image-url"
            type="url"
            value={values.imageUrl}
            onChange={(event) => {
              touchImage();
              setValues((current) => ({ ...current, imageUrl: event.target.value }));
            }}
            aria-invalid={errors.image_url ? true : undefined}
            aria-describedby={errors.image_url ? "pf-image-url-error" : undefined}
            placeholder="https://chariow.com/images/ma-vignette.jpg"
            className="input"
          />
          {errors.image_url ? (
            <p id="pf-image-url-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
              {errors.image_url}
            </p>
          ) : null}
        </fieldset>

        {formMessage ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {formMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} disabled={saving} className="btn btn-outline text-sm">
            <ArrowLeft size={16} aria-hidden />
            Annuler
          </button>
          <button type="submit" disabled={saving} className="btn btn-yellow text-sm" aria-busy={saving}>
            {saving ? (
              <LoaderCircle size={16} aria-hidden className="animate-spin" />
            ) : (
              <Save size={16} aria-hidden />
            )}
            {saving
              ? "Enregistrement…"
              : mode === "create"
                ? "Enregistrer le produit"
                : "Enregistrer les modifications"}
          </button>
        </div>
      </form>

      {/* --------------------------- Aperçu --------------------------- */}
      <aside className="md:border-l md:border-slate-200/70 md:pl-7">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Aperçu
          </h3>
          <span className="rounded-full bg-yellow-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-800">
            Aperçu réel
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          Voici exactement la vignette telle qu'elle apparaîtra sur la boutique.
          Elle suit vos modifications en direct.
        </p>

        <div className="mt-4">
          <ProductCardView
            name={values.name.trim() || "Nom du produit"}
            description={values.description.trim() || "Une description courte du produit apparaîtra ici."}
            priceLabel={formatPrice(priceNumber, currency)}
            imageUrl={previewImage}
            href="#"
            preview
          />
        </div>

        {previewImage === null ? (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
            <ImageOff size={13} aria-hidden className="mt-0.5 shrink-0" />
            Aucune image : un emplacement bleu élégant sera affiché à ses visiteurs.
          </p>
        ) : null}
      </aside>
    </div>
  );
}
