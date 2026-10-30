import { ArrowUpRight, ShoppingBag } from "lucide-react";

export type ProductCardViewProps = {
  name: string;
  description: string;
  priceLabel: string;
  imageUrl: string | null;
  href: string;
  /** En mode aperçu (administration), le bouton n'est pas cliquable. */
  preview?: boolean;
};

/**
 * Vignette produit — même rendu pour la boutique publique et l'aperçu
 * de l'administration, pour éviter toute surprise à la publication.
 */
export default function ProductCardView({
  name,
  description,
  priceLabel,
  imageUrl,
  href,
  preview = false,
}: ProductCardViewProps) {
  return (
    <article className="glass card-lift flex flex-col overflow-hidden rounded-3xl">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-900">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Image du produit : ${name}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-white/60">
            <ShoppingBag size={44} aria-hidden />
          </span>
        )}
        {/* Dégradé bas qui assure la continuité visuelle avec la carte */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/25 to-transparent"
        />
      </div>

      <div className="flex grow flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900">
          {name}
        </h3>
        <p className="grow text-sm leading-relaxed text-slate-600 line-clamp-3">
          {description}
        </p>

        <p className="text-xl font-extrabold tracking-tight text-blue-700">
          {priceLabel}
          <span className="sr-only"> — paiement sur Chariow</span>
        </p>

        {preview ? (
          <>
            <span className="btn btn-yellow pointer-events-none w-full select-none">
              Acheter sur Chariow
              <ArrowUpRight size={18} aria-hidden />
            </span>
            <p className="text-center text-xs text-slate-400">
              Aperçu : le bouton réel ouvrira la page Chariow du produit.
            </p>
          </>
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="btn btn-yellow w-full"
          >
            Acheter sur Chariow
            <ArrowUpRight size={18} aria-hidden />
            <span className="sr-only"> (nouvelle fenêtre)</span>
          </a>
        )}
      </div>
    </article>
  );
}
