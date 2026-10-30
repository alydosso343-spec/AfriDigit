"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CloudOff } from "lucide-react";
import { Logo } from "@/components/logo";

/** Page d'erreur globale : garde le ton du site et propose de recharger. */
export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AfriDigit] Erreur de la page :", error);
  }, [error]);

  return (
    <main id="contenu" className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-0 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-yellow-300/35 blur-3xl" />
      </div>
      <div className="glass animate-rise w-full max-w-md rounded-3xl p-9 text-center">
        <Logo className="mx-auto h-10" />
        <span className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
          <CloudOff size={26} aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
          Oups, une erreur est survenue
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Quelque chose ne s'est pas passé comme prévu. Rechargez la page :
          si le problème persiste, réessayez un peu plus tard.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-yellow">
            Recharger la page
          </button>
          <Link href="/" className="btn btn-outline">
            Retour à la boutique
          </Link>
        </div>
      </div>
    </main>
  );
}
