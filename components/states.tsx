"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CircleAlert, LoaderCircle, RefreshCw } from "lucide-react";

/** Squelettes de cartes affichées pendant le chargement des produits. */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="glass animate-pulse overflow-hidden rounded-3xl"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <div className="aspect-[16/10] w-full bg-slate-200/70" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 rounded-full bg-slate-200/80" />
            <div className="h-3.5 w-full rounded-full bg-slate-200/60" />
            <div className="h-3.5 w-5/6 rounded-full bg-slate-200/60" />
            <div className="mt-4 h-9 w-full rounded-full bg-slate-200/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** État « aucun produit » : sobre et discret, aucune fausse donnée. */
export function ProductGridEmpty() {
  return (
    <div className="mx-auto max-w-xl px-6 py-14 text-center">
      <p className="text-lg font-semibold text-slate-700">
        Pas de formation disponible pour le moment.
      </p>
      <p className="mt-1.5 text-sm text-slate-500">
        Soyez à l&apos;affût — de nouvelles formations arrivent bientôt.
      </p>
    </div>
  );
}

/** Bouton de réessai (client) après une erreur de chargement. */
export function RefreshButton({
  label = "Réessayer",
  className = "btn btn-blue text-sm",
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      aria-busy={isPending}
      className={className}
    >
      {isPending ? (
        <LoaderCircle size={16} aria-hidden className="animate-spin" />
      ) : (
        <RefreshCw size={16} aria-hidden />
      )}
      {label}
    </button>
  );
}

/** État d'erreur du chargement des produits, avec bouton « Réessayer ». */
export function ProductGridError({ detail }: { detail?: string }) {
  return (
    <div className="glass mx-auto max-w-xl rounded-3xl p-10 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
        <CircleAlert size={26} aria-hidden />
      </span>
      <h3 className="mt-5 text-lg font-bold text-slate-900">
        Impossible d'afficher les produits
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Une erreur est survenue pendant le chargement de la boutique.
        Vérifiez votre connexion, ou réessayez dans un instant.
      </p>
      <RefreshButton className="btn btn-blue mx-auto mt-6 text-sm" />
      {detail ? (
        <p className="mt-4 text-xs text-slate-400">Détail technique : {detail}</p>
      ) : null}
    </div>
  );
}
