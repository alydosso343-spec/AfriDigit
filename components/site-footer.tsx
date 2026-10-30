import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
];

/** Pied de page simple du site public (liens vers les vraies pages). */
export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-slate-100 bg-gradient-to-b from-blue-50/70 to-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1.2fr]">
        <div>
          <Logo className="h-10" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
            Une boutique de produits numériques simple et accueillante : ebooks,
            formations et outils, accessibles en un clic. Le paiement est
            effectué en toute sécurité sur Chariow.
          </p>
        </div>

        <nav aria-label="Pied de page">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Navigation
          </h2>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Informations
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2.5">
              <ShieldCheck size={18} aria-hidden className="mt-0.5 shrink-0 text-blue-600" />
              <span>
                Paiement sécurisé via{" "}
                <span className="font-semibold text-slate-800">Chariow</span> :
                vous êtes redirigé vers la page officielle du produit.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:px-6">
          <p>© {year} AfriDigit. Tous droits réservés.</p>
          <p>Boutique de produits numériques — paiements gérés par Chariow.</p>
        </div>
      </div>
    </footer>
  );
}
