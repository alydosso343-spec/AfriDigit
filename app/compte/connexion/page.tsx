import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { Logo } from "@/components/logo";
import { getCustomerSession } from "@/lib/supabase/auth-server";
import SignInForm from "./connexion-form";

export const metadata: Metadata = {
  title: "Connexion à votre espace | AfriDigit",
  description: "Connectez-vous à votre espace client AfriDigit.",
  robots: { index: false, follow: false },
};

type ConnexionProps = {
  searchParams: Promise<{ inscrit?: string }>;
};

/**
 * Connexion de l'ESPACE CLIENT (visiteurs). `?inscrit=1` est posé après
 * l'inscription lorsqu'une confirmation par e-mail est requise.
 */
export default async function ConnexionClientPage({ searchParams }: ConnexionProps) {
  const session = await getCustomerSession();
  if (session) {
    redirect("/compte");
  }
  const { inscrit } = await searchParams;

  return (
    <main id="contenu" className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
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

        <h1 className="mt-7 text-2xl font-extrabold tracking-tight text-slate-900">
          Connexion
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Accédez à votre espace client AfriDigit.
        </p>

        {inscrit === "1" ? (
          <div
            role="status"
            className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800"
          >
            <p className="font-semibold">Compte créé 🎉</p>
            <p className="mt-1">
              Si un e-mail de confirmation est requis, consultez votre boîte
              de réception, puis connectez-vous ci-dessous.
            </p>
          </div>
        ) : null}

        <SignInForm />

        <p className="mt-6 flex items-center gap-2 text-sm text-slate-600">
          <LogIn size={16} aria-hidden className="text-blue-600" />
          Pas encore de compte ?{" "}
          <Link
            href="/compte/inscription"
            className="font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-offset-4 rounded"
          >
            Créez-le en 1 minute
          </Link>
        </p>
      </div>
    </main>
  );
}
