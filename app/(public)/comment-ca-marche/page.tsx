import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Sparkles, Zap } from "lucide-react";
import HowItWorks from "@/components/how-it-works";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description:
    "Trois étapes simples : choisissez un produit sur AfriDigit, payez en sécurité sur Chariow, récupérez immédiatement votre achat.",
};

/** Page dédiée au fonctionnement du site (avec rappels de sécurité). */
export default function HowItWorksPage() {
  return (
    <>
      <section aria-labelledby="etapes-en-tete" className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-drift absolute -top-24 left-[12%] h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="animate-drift-slow absolute right-[8%] top-4 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-4 pt-10 text-center sm:px-6 sm:pt-14">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
            <Sparkles size={13} aria-hidden />
            La démarche en détail
          </span>
          <h1
            id="etapes-en-tete"
            className="animate-rise mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
          >
            Acheter sur AfriDigit,{" "}
            <span className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 bg-clip-text text-transparent">
              en trois étapes
            </span>
          </h1>
          <p className="animate-rise delay-1 mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Pas de compte à créer, pas de panier à animer : la boutique vous
            présente les produits, Chariow s&apos;occupe du paiement et de la
            livraison. Voici exactement ce qui se passe.
          </p>
        </div>
      </section>

      <HowItWorks variant="full" />

      <section aria-labelledby="rappels-titre">
        <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <h2 id="rappels-titre" className="text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Ce qui est garanti
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <article className="glass card-lift rounded-3xl p-6">
              <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
                <Zap size={21} aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Accès immédiat</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Dès que Chariow confirme le paiement, votre fichier ou votre
                accès vous est remis immédiatement : aucune attente, aucun
                aller-retour par e-mail.
              </p>
            </article>

            <article className="glass card-lift rounded-3xl p-6">
              <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
                <ShoppingBag size={21} aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Prix régulier</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Le prix affiché sur la vitrine est identique à celui de la page
                Chariow : le site ne prend aucune commission et ne modifie
                jamais le montant en cours de route.
              </p>
            </article>

            <article className="glass card-lift rounded-3xl p-6">
              <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
                <Sparkles size={21} aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Lien vérifié</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Chaque bouton d&apos;achat pointe vers une adresse https validée
                côté serveur : impossible d&apos;être redirigé vers un site
                douteux depuis AfriDigit.
              </p>
            </article>
          </div>

          <div className="mt-10 text-center">
            <Link href="/produits" className="btn btn-yellow px-6 py-3.5 text-base">
              <ShoppingBag size={18} aria-hidden />
              Voir les produits maintenant
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
