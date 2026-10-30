import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main id="contenu" className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-300/35 blur-3xl" />
      </div>
      <div className="glass animate-rise w-full max-w-md rounded-3xl p-9 text-center">
        <Logo className="mx-auto h-10" />
        <span className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
          <Compass size={26} aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Page introuvable</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link href="/" className="btn btn-yellow mt-7">
          Retour à la boutique
        </Link>
      </div>
    </main>
  );
}
