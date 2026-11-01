import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, LogOut } from "lucide-react";
import { signOutAdmin } from "@/app/actions";
import { requireAdminSession } from "@/lib/admin-guard";
import { LogoMark } from "@/components/logo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Coquille du tableau de bord d'administration.
 * requireAdminSession() effectue la vérification réelle côté serveur
 * (cookie signé + adresse autorisée) et redirige vers la page de
 * connexion dans le cas contraire.
 *
 * Ce layout vit dans un route group `(dashboard)` afin de ne PAS
 * s'appliquer à la page de connexion (app/admin/login), elle-même
 * sous /admin : sans cela, la garde redirigerait en boucle.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className="relative min-h-dvh bg-slate-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72">
        <div className="absolute -top-20 left-[10%] h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute right-[8%] top-0 h-64 w-64 rounded-full bg-yellow-300/30 blur-3xl" />
      </div>

      <header className="relative z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="glass mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-3xl px-4 py-3 sm:px-5">
          <Link href="/admin" className="flex items-center gap-2.5 rounded-2xl focus-visible:outline-offset-4">
            <LogoMark className="h-9 w-9" />
            <span className="font-extrabold tracking-tight text-slate-900">
              Afri<span className="text-blue-700">Digit</span>
            </span>
            <span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 sm:inline">
              Administration
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="btn btn-outline text-sm" title="Ouvrir la boutique (nouvel onglet)">
              <ExternalLink size={16} aria-hidden />
              <span className="hidden sm:inline">Voir le site</span>
            </Link>
            <form action={signOutAdmin}>
              <button type="submit" className="btn btn-navy text-sm">
                <LogOut size={16} aria-hidden />
                <span className="hidden sm:inline">Se déconnecter</span>
                <span className="sr-only sm:hidden">Se déconnecter</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="contenu" className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">
        <p className="sr-only">Connectée en tant que {session.email}</p>
        {children}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <p className="text-center text-xs text-slate-400">
          Espace réservé à l&apos;administratrice d&apos;AfriDigit. Les données
          sont protégées côté serveur (session signée + clé d&apos;écriture
          dédiée).
        </p>
      </footer>
    </div>
  );
}
