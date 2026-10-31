"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LogIn, Menu, ShieldCheck, ShoppingBag, UserRound, X } from "lucide-react";
import { Logo } from "@/components/logo";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
];

/** Classe du lien : bleu plein (la « barre ») quand on est sur cette page. */
function linkClass(isActive: boolean): string {
  return isActive
    ? "bg-blue-700 text-white shadow-sm"
    : "text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-800 hover:underline";
}

/**
 * En-tête du site public. Le lien de la page courante est surligné d'une
 * barre bleue pleine (aria-current="page") : on sait toujours sur quel
 * onglet / volet on se trouve. Menu déroulant sur mobile.
 *
 * Accès adaptés selon la session lue côté serveur :
 *  - `isAdmin`      → pastille discrète « Espace admin » (rien n'annonce
 *    l'administration tant que la session n'est pas ouverte : l'admin
 *    ouvre /connexion directement par l'adresse) ;
 *  - `customerName` → « Bonjour {prénom} » vers l'espace client ;
 *  - visiteur       → « S'inscrire » + « Connexion » (espace client).
 */
export default function SiteHeader({
  isAdmin = false,
  customerName,
}: {
  isAdmin?: boolean;
  customerName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="relative z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="mx-auto max-w-6xl">
        <div className="glass flex items-center justify-between gap-3 rounded-full px-4 py-3 sm:px-6">
          <Link
            href="/"
            aria-label="AfriDigit — aller à la page d'accueil"
            className="rounded-2xl focus-visible:outline-offset-4"
          >
            <Logo className="h-9 sm:h-10" />
          </Link>

          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`block rounded-full px-3.5 py-2 text-sm font-medium ${linkClass(isActive(link.href))}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Link href="/admin" className="btn btn-outline hidden text-sm sm:inline-flex">
                <ShieldCheck size={17} aria-hidden />
                Espace admin
              </Link>
            ) : null}

            {customerName ? (
              <Link href="/compte" className="btn btn-outline hidden text-sm sm:inline-flex">
                <UserRound size={17} aria-hidden />
                <span className="max-w-36 truncate">Bonjour {customerName}</span>
              </Link>
            ) : isAdmin ? null : (
              <>
                <Link
                  href="/compte/inscription"
                  className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-800 sm:inline-flex"
                >
                  S&apos;inscrire
                </Link>
                <Link
                  href="/compte/connexion"
                  className="btn btn-outline hidden text-sm sm:inline-flex"
                >
                  <LogIn size={17} aria-hidden />
                  Connexion
                </Link>
              </>
            )}

            <Link href="/produits" className="btn btn-yellow hidden text-sm sm:inline-flex">
              <ShoppingBag size={17} aria-hidden />
              Découvrir les produits
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen((current) => !current)}
              aria-expanded={isOpen}
              aria-controls="menu-mobile"
              aria-label={isOpen ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"}
              className="btn-icon !rounded-full md:hidden"
            >
              {isOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div
            id="menu-mobile"
            className="glass animate-rise mx-auto mt-2 max-w-xl rounded-3xl p-4 md:hidden"
          >
            <nav aria-label="Navigation mobile">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={`block rounded-2xl px-4 py-3 text-base font-medium ${
                        isActive(link.href)
                          ? "bg-blue-700 text-white"
                          : "text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-800"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {isAdmin ? (
              <Link href="/admin" onClick={close} className="btn btn-outline mt-3 w-full">
                <ShieldCheck size={17} aria-hidden />
                Espace admin
              </Link>
            ) : null}
            {customerName ? (
              <Link href="/compte" onClick={close} className="btn btn-outline mt-3 w-full">
                <UserRound size={17} aria-hidden />
                Bonjour {customerName}
              </Link>
            ) : isAdmin ? null : (
              <>
                <Link href="/compte/inscription" onClick={close} className="btn btn-outline mt-3 w-full">
                  <UserRound size={17} aria-hidden />
                  S&apos;inscrire
                </Link>
                <Link href="/compte/connexion" onClick={close} className="btn btn-outline mt-3 w-full">
                  <LogIn size={17} aria-hidden />
                  Connexion
                </Link>
              </>
            )}
            <Link href="/produits" onClick={close} className="btn btn-yellow mt-3 w-full">
              <ShoppingBag size={17} aria-hidden />
              Découvrir les produits
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
