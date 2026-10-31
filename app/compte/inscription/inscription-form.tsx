"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  INITIAL_AUTH_STATE,
  signUpCustomer,
} from "@/app/account-actions";

/**
 * Formulaire d'inscription client. La validationZod est partagée avec le
 * serveur ; en cas de compte auto-confirmé, l'inscription connecte
 * directement (redirection /compte). Sinon, un e-mail de confirmation
 * est envoyé et l'utilisateur est invité à le vérifier.
 */
export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    signUpCustomer,
    INITIAL_AUTH_STATE
  );

  const nameError = state.fieldErrors?.name;
  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;

  return (
    <form action={formAction} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="inscrire-name" className="field-label">
          Prénom
        </label>
        <input
          id="inscrire-name"
          name="name"
          type="text"
          required
          autoComplete="given-name"
          maxLength={40}
          placeholder="Ex. Aïcha"
          aria-invalid={nameError ? "true" : undefined}
          aria-describedby={nameError ? "erreur-inscrire-name" : undefined}
          className="input"
        />
        {nameError ? (
          <p id="erreur-inscrire-name" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
            {nameError}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="inscrire-email" className="field-label">
          Adresse e-mail
        </label>
        <input
          id="inscrire-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={160}
          placeholder="prenom@exemple.com"
          aria-invalid={emailError ? "true" : undefined}
          aria-describedby={emailError ? "erreur-inscrire-email" : undefined}
          className="input"
        />
        {emailError ? (
          <p id="erreur-inscrire-email" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
            {emailError}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="inscrire-password" className="field-label">
          Mot de passe
        </label>
        <input
          id="inscrire-password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          aria-invalid={passwordError ? "true" : undefined}
          aria-describedby={passwordError ? "erreur-inscrire-password" : undefined}
          className="input"
        />
        {passwordError ? (
          <p id="erreur-inscrire-password" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
            {passwordError}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-400">
            8 caractères minimum : lettres, chiffres… l'important est d'être
            unique pour votre compte.
          </p>
        )}
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm leading-relaxed text-red-700"
        >
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="btn btn-blue w-full" disabled={isPending} aria-busy={isPending}>
        {isPending ? (
          <>
            <LoaderCircle size={17} aria-hidden className="animate-spin" />
            Création en cours…
          </>
        ) : (
          "Créer mon compte"
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        En créant votre compte, vous acceptez la{" "}
        <Link href="/politique-de-confidentialite" className="underline underline-offset-2 hover:text-slate-600">
          politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}
