import Link from "next/link";
import { Globe, ShieldCheck, ShoppingBag, Sparkles, Zap } from "lucide-react";

const TRUST_CHIPS = [
  { icon: ShieldCheck, label: "Paiement sécurisé via Chariow" },
  { icon: Zap, label: "Accès immédiat après l'achat" },
  { icon: Globe, label: "Contenus pensés pour l'Afrique" },
];

/** Section d'accueil : titre accrocheur, présentation courte et appels à l'action. */
export default function Hero() {
  return (
    <section aria-labelledby="hero-titre" className="relative overflow-hidden">
      {/* Halos décoratifs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-drift absolute -top-28 left-[8%] h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="animate-drift-slow absolute right-[5%] top-8 h-96 w-96 rounded-full bg-yellow-300/40 blur-3xl" />
        <div className="absolute bottom-0 left-[35%] h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-20 sm:pt-16">
        <ul className="animate-rise flex flex-wrap items-center justify-center gap-2.5">
          {TRUST_CHIPS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 sm:text-sm"
            >
              <Icon size={15} aria-hidden className="text-blue-600" />
              {label}
            </li>
          ))}
        </ul>

        <h1
          id="hero-titre"
          className="animate-rise delay-1 mx-auto mt-8 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
        >
          Les produits digitaux de qualité,{" "}
          <span className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 bg-clip-text text-transparent">
            pensés pour l'Afrique
          </span>
        </h1>

        <p className="animate-rise delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          <strong className="font-semibold text-slate-800">AfriDigit</strong>{" "}
          rassemble des ebooks, des formations et des outils numériques prêts à
          l'usage. Parcourez la vitrine, puis payez en toute sécurité sur
          Chariow : votre achat est accessible immédiatement.
        </p>

        <div className="animate-rise delay-3 mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/produits" className="btn btn-yellow px-6 py-3.5 text-base">
            <ShoppingBag size={19} aria-hidden />
            Découvrir les produits
          </Link>
          <Link href="/comment-ca-marche" className="btn btn-outline px-6 py-3.5 text-base">
            <Sparkles size={18} aria-hidden />
            Comment ça marche ?
          </Link>
        </div>
      </div>
    </section>
  );
}
