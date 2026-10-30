"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CircleAlert,
  ExternalLink,
  PackageOpen,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteProduct,
  reorderProducts,
} from "@/app/actions";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/products";
import ProductForm from "@/components/admin/product-form";

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; product: Product }
  | null;

type StatusToast = {
  kind: "ok" | "error";
  message: string;
} | null;

type ProductManagerProps = {
  initialProducts: Product[];
  initialLoadFailed: boolean;
  currency: string;
};

/** Tableau de bord d'administration des produits. */
export default function ProductManager({
  initialProducts,
  initialLoadFailed,
  currency,
}: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editor, setEditor] = useState<EditorState>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [status, setStatus] = useState<StatusToast>(null);
  const [isBusy, setIsBusy] = useState(false); // suppression en cours
  const [, startTransition] = useTransition();
  const router = useRouter();

  const overlayOpen = editor !== null || deleting !== null;

  /* Le blocage du défilement + la touche Échap pendant une modale. */
  useEffect(() => {
    if (!overlayOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditor(null);
        setDeleting(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [overlayOpen]);

  /* Disparition automatique du message de confirmation. */
  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), 6000);
    return () => window.clearTimeout(timer);
  }, [status]);

  function announce(kind: "ok" | "error", message: string) {
    setStatus({ kind, message });
  }

  /** Fusionne un produit créé ou modifié dans la liste locale. */
  function upsert(product: Product) {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);
      const next = exists
        ? current.map((item) => (item.id === product.id ? product : item))
        : [...current, product];
      return [...next].sort(
        (a, b) =>
          a.position - b.position ||
          a.created_at.localeCompare(b.created_at)
      );
    });
  }

  /** Échange deux positions et enregistre le nouvel ordre en base. */
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= products.length) return;
    const before = products;
    const next = [...before];
    [next[index], next[target]] = [next[target], next[index]];
    setProducts(next);
    startTransition(async () => {
      const result = await reorderProducts(next.map((product) => product.id));
      if (result.ok) {
        announce("ok", "Ordre des produits mis à jour.");
      } else {
        setProducts(before);
        announce("error", result.message ?? "Impossible d'enregistrer le nouvel ordre.");
      }
    });
  }

  async function confirmDelete() {
    if (!deleting || isBusy) return;
    setIsBusy(true);
    const result = await deleteProduct(deleting.id);
    setIsBusy(false);
    if (result.ok) {
      setProducts((current) => current.filter((p) => p.id !== deleting.id));
      announce("ok", result.message ?? "Le produit a été supprimé.");
      setDeleting(null);
      router.refresh();
    } else {
      announce("error", result.message ?? "La suppression a échoué.");
      setDeleting(null);
    }
  }

  return (
    <div>
      {/* En-tête du tableau de bord */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Gestion des produits
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {products.length === 0
              ? "Aucun produit en ligne pour l'instant."
              : `${products.length} produit${products.length > 1 ? "s" : ""} en ligne dans la boutique.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ mode: "create" })}
          className="btn btn-yellow text-sm"
        >
          <Plus size={17} aria-hidden />
          Nouveau produit
        </button>
      </div>

      {initialLoadFailed ? (
        <div
          role="alert"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"
        >
          <p className="text-sm text-red-800">
            Impossible de lire la liste des produits depuis la base de données.
            Vérifiez la configuration Supabase puis rechargez la page.
          </p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="btn btn-red text-sm"
          >
            Recharger
          </button>
        </div>
      ) : null}

      {/* Liste des produits */}
      {products.length === 0 && !initialLoadFailed ? (
        <div className="glass mt-8 rounded-3xl p-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
            <PackageOpen size={26} aria-hidden />
          </span>
          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Commencez par votre premier produit
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Cliquez sur « Nouveau produit » : nom, prix, description courte,
            lien Chariow et vignette. L'aperçu s'affiche en direct avant
            l'enregistrement.
          </p>
        </div>
      ) : (
        <ul
          aria-label="Liste des produits"
          className="mt-7 space-y-3"
        >
          {products.map((product, index) => (
            <li
              key={product.id}
              className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center"
            >
              {/* Contrôles d'ordre */}
              <div className="flex gap-1.5 sm:flex-col">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="btn-icon disabled:opacity-30"
                  aria-label={`Monter le produit « ${product.name} »`}
                  title="Monter d'une position"
                >
                  <ArrowUp size={16} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === products.length - 1}
                  className="btn-icon disabled:opacity-30"
                  aria-label={`Descendre le produit « ${product.name} »`}
                  title="Descendre d'une position"
                >
                  <ArrowDown size={16} aria-hidden />
                </button>
              </div>

              {/* Vignette + infos */}
              <div className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-900">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ShoppingBag size={17} aria-hidden className="text-white/70" />
                )}
              </div>

              <div className="min-w-0 grow">
                <p className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-700"
                  >
                    #{index + 1}
                  </span>
                  <span className="truncate font-semibold text-slate-900">
                    {product.name}
                  </span>
                </p>
                <p className="truncate text-sm text-slate-500">
                  {product.description}
                </p>
              </div>

              {/* Prix + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <p className="mr-1 whitespace-nowrap text-base font-extrabold text-blue-700">
                  {formatPrice(product.price, currency)}
                </p>
                <a
                  href={product.chariow_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-icon"
                  aria-label={`Ouvrir la page Chariow du produit ${product.name} (nouvelle fenêtre)`}
                  title="Vérifier le lien Chariow"
                >
                  <ExternalLink size={16} aria-hidden />
                </a>
                <button
                  type="button"
                  onClick={() => setEditor({ mode: "edit", product })}
                  className="btn-icon"
                  aria-label={`Modifier le produit ${product.name}`}
                >
                  <Pencil size={16} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(product)}
                  className="btn-icon btn-icon-danger"
                  aria-label={`Supprimer le produit ${product.name}`}
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-slate-400" aria-hidden="true">
        Astuce : les flèches réorganisent les produits ; le premier élément
        apparaît en premier sur la boutique.
      </p>

      {/* ------------------------- Modale éditeur ------------------------- */}
      {editor ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
        >
          <div
            aria-hidden="true"
            onClick={() => setEditor(null)}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]"
          />
          <div className="glass animate-rise relative max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="editor-title" className="text-xl font-extrabold text-slate-900">
                  {editor.mode === "create" ? "Nouveau produit" : "Modifier le produit"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editor.mode === "create"
                    ? "Renseignez les informations, vérifiez l'aperçu, puis enregistrez."
                    : "Les modifications apparaissent sur la boutique après enregistrement."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="btn-icon shrink-0"
                aria-label="Fermer le formulaire"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <ProductForm
              key={editor.mode === "edit" ? editor.product.id : "create"}
              mode={editor.mode}
              product={editor.mode === "edit" ? editor.product : undefined}
              currency={currency}
              onSaved={(product, message) => {
                upsert(product);
                setEditor(null);
                announce("ok", message);
                router.refresh();
              }}
              onCancel={() => setEditor(null)}
            />
          </div>
        </div>
      ) : null}

      {/* ------------------------ Modale suppression ---------------------- */}
      {deleting ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed inset-0 z-50 grid place-items-center p-4"
        >
          <div
            aria-hidden="true"
            onClick={() => setDeleting(null)}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]"
          />
          <div className="glass animate-rise relative w-full max-w-md rounded-3xl p-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
              <CircleAlert size={22} aria-hidden />
            </span>
            <h2 id="delete-title" className="mt-4 text-lg font-extrabold text-slate-900">
              Supprimer « {deleting.name} » ?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Ce produit disparaîtra aussitôt de la boutique et son image
              hébergée sera supprimée. Cette action est définitive.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="btn btn-outline text-sm"
                disabled={isBusy}
              >
                Conserver le produit
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn btn-red text-sm"
                disabled={isBusy}
                aria-busy={isBusy}
              >
                <Trash2 size={16} aria-hidden />
                {isBusy ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---------------------------- Message ----------------------------- */}
      {status ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2"
        >
          <div
            className={
              "glass animate-rise flex items-center gap-2.5 rounded-full py-2.5 pl-4 pr-2.5 text-sm font-medium shadow-lg " +
              (status.kind === "ok" ? "text-emerald-800" : "text-red-700")
            }
          >
            {status.kind === "ok" ? (
              <Check size={17} aria-hidden className="text-emerald-600" />
            ) : (
              <CircleAlert size={17} aria-hidden className="text-red-600" />
            )}
            <span>{status.message}</span>
            <button
              type="button"
              onClick={() => setStatus(null)}
              className="btn-icon ml-1"
              aria-label="Fermer le message"
            >
              <X size={15} aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
