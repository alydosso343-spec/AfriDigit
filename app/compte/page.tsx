import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOut, Mail, ShoppingBag, UserRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { getCustomerSession } from "@/lib/supabase/auth-server";
import { signOutCustomer } from "@/app/account-actions";

export const metadata: Metadata = {
  title: "Mon espace",
  description: "Votre espace personnel AfriDigit.",
  robots: { index: false, follow: false },
};

/**
 * Espace personnel du client connecté. Page protégée côté serveur :
 * sans session Supabase, retour à la page de connexion. Aucune donnée
 * sensible au-delà du prénom et de l'adresse e-mail renseignés.
 */
export default async function ComptePage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/compte/connexion");
  }

  const prenom = session.name.trim() || session.email.split("@")[0] || "client";

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[5%] h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute bottom-0 right-[5%] h-80 w-80 rounded-full bg-yellow-300/35 blur-3xl" />
      </div>

      <div className="glass animate-rise w-full max-w-md rounded-3xl p-8 sm:p-9">
        <Link
          href="/"
          aria-label="Retour à la boutique AfriDigit"
          className="inline-flex rounded-2xl focus-visible:outline-offset-4"
        >
          <Logo className="h-10" />
        </Link>

        <p className="mt-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
          <UserRound size={15} aria-hidden />
          Espace client
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          Bonjour {prenom}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Votre espace personnel AfriDigit. Vos favoris et vos achats y
          apparaîtront au fil de vos visites.
        </p>

        <dl className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-white/70 p-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 font-medium text-slate-500">
              <UserRound size={15} aria-hidden />
              Prénom
            </dt>
            <dd className="text-right font-semibold text-slate-900">{prenom}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 font-medium text-slate-500">
              <Mail size={15} aria-hidden />
              E-mail
            </dt>
            <dd className="break-all text-right font-semibold text-slate-900">
              {session.email}
            </dd>
          </div>
        </dl>

        <div className="mt-6 space-y-3">
          <Link href="/produits" className="btn btn-blue w-full">
            <ShoppingBag size={17} aria-hidden />
            Découvrir les produits
          </Link>
          <form action={signOutCustomer}>
            <button type="submit" className="btn btn-outline w-full">
              <LogOut size={17} aria-hidden />
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
