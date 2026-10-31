import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Logo } from "@/components/logo";
import { getCustomerSession } from "@/lib/supabase/auth-server";
import SignUpForm from "./inscription-form";

export const metadata: Metadata = {
  title: "Créer un compte | AfriDigit",
  description: "Créez votre compte AfriDigit pour suivre vos formations et vos achats.",
  robots: { index: false, follow: false },
};

/** Page d'INSCRIPTION de l'espace client (visiteurs visiteur/devise). */
export default async function InscriptionPage() {
  const session = await getCustomerSession();
  if (session) {
    // Déjà connecté : pas de page d'inscription nécessaire.
    redirect("/compte");
  }

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
          Créer un compte
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Rejoignez AfriDigit : votre espace personnel vous suivra de
          formation en formation.
        </p>

        <SignUpForm />

        <p className="mt-6 flex items-center gap-2 text-sm text-slate-600">
          <UserPlus size={16} aria-hidden className="text-blue-600" />
          Déjà un compte ?{" "}
          <Link
            href="/compte/connexion"
            className="font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-offset-4 rounded"
          >
            Connectez-vous
          </Link>
        </p>
      </div>
    </main>
  );
}
