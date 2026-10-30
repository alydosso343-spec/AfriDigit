import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous pour accéder à votre espace.",
  robots: { index: false, follow: false },
};

type ConnexionPageProps = {
  searchParams: Promise<{
    err?: "auth";
    state?: "not_configured";
  }>;
};

/**
 * Connexion générique : la page ne révèle pas la nature de l'espace
 * protégé (ni l'adresse autorisée, ni son usage). La vérification est
 * forgée intégralement côté serveur ; après une connexion réussie, la
 * session mène à l'espace de gestion.
 */
export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const { err, state } = await searchParams;

  return (
    <main id="contenu" className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[5%] h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute bottom-0 right-[5%] h-80 w-80 rounded-full bg-yellow-300/35 blur-3xl" />
      </div>

      <div className="glass animate-rise w-full max-w-md rounded-3xl p-8 sm:p-9">
        <Link href="/" className="inline-flex rounded-2xl focus-visible:outline-offset-4" aria-label="Retour à la boutique AfriDigit">
          <Logo className="h-10" />
        </Link>

        <h1 className="mt-7 text-2xl font-extrabold tracking-tight text-slate-900">
          Connexion
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Connectez-vous pour accéder à votre espace.
        </p>

        {state === "not_configured" ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800"
          >
            <p className="font-semibold">Indisponible pour l&apos;instant</p>
            <p className="mt-1">
              Cette partie du site n&apos;est pas encore activée. Revenez plus tard.
            </p>
          </div>
        ) : (
          err === "auth" && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
              <p className="font-semibold text-red-800">Session expirée</p>
              <p className="mt-1 leading-relaxed text-red-700">
                Merci de vous reconnecter pour continuer.
              </p>
            </div>
          )
        )}

        <LoginForm />

        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
          <ShieldCheck size={15} aria-hidden className="mt-0.5 shrink-0 text-blue-600" />
          Vos identifiants sont vérifiés côté serveur. Cette page n&apos;est
          volontairement pas référencée par les moteurs de recherche.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl text-sm font-medium text-slate-500 transition-colors hover:text-blue-700 focus-visible:outline-offset-4"
        >
          <ArrowLeft size={15} aria-hidden />
          Retour à la boutique
        </Link>
      </div>
    </main>
  );
}
