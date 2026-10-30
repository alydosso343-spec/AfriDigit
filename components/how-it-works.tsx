import Link from "next/link";
import { ArrowRight, CreditCard, MousePointerClick, PackageOpen } from "lucide-react";

const STEPS = [
  {
    number: 1,
    icon: MousePointerClick,
    title: "Choisissez votre produit",
    text: "Parcourez la vitrine : chaque produit affiche son image, son prix et une description claire. Rien de plus à décrypter.",
  },
  {
    number: 2,
    icon: CreditCard,
    title: "Payez sur Chariow",
    text: "Le bouton d'achat ouvre la page officielle du produit sur Chariow. C'est sur cette plateforme sécurisée que le paiement s'effectue.",
  },
  {
    number: 3,
    icon: PackageOpen,
    title: "Récupérez votre achat",
    text: "Une fois le paiement validé, Chariow vous délivre immédiatement votre produit : fichier téléchargeable ou accès direct.",
  },
];

type HowItWorksProps = {
  /**
   * "compact" (page d'accueil) : titre moyen + lien vers la page dédiée ;
   * "full" (page /comment-ca-marche) : titre principal + applications.
   */
  variant?: "compact" | "full";
};

/** Section pédagogique « Comment ça marche », en trois cartes de verre. */
export default function HowItWorks({ variant = "full" }: HowItWorksProps) {
  const isCompact = variant === "compact";

  return (
    <section aria-labelledby="etapes-titre" id="etapes">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={isCompact ? "text-center" : "text-center"}>
          <h2
            id="etapes-titre"
            className={
              isCompact
                ? "text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
                : "text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
            }
          >
            Comment ça marche ?
          </h2>
          <p
            className={
              isCompact
                ? "mx-auto mt-2 max-w-xl text-slate-600"
                : "mx-auto mt-3 max-w-xl text-slate-600"
            }
          >
            Trois étapes, aucun compte à créer ici : AfriDigit vous présente le
            produit, Chariow s'occupe du paiement et de la livraison.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(({ number, icon: Icon, title, text }) => (
            <article key={number} className="glass card-lift rounded-3xl p-6 text-left">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
                  <Icon size={21} aria-hidden />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Étape {number}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
            </article>
          ))}
        </div>

        {isCompact ? (
          <div className="mt-8 text-center">
            <Link href="/comment-ca-marche" className="btn btn-outline text-sm">
              La démarche en détail
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
