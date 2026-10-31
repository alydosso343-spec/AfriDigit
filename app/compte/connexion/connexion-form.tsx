"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  INITIAL_AUTH_STATE,
  signInCustomer,
} from "@/app/account-actions";

/**
 * Formulaire de connexion CLIENT. Message d'erreur volontairement unique
 * (« E-mail ou mot de passe incorrect. ») : rien ne révèle si le compte
 * existe, vers qui pointer une tentative, ni la raison du refus.
 */
export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(
    signInCustomer,
    INITIAL_AUTH_STATE
  );

  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;

  return (
    <form action={formAction} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="client-email" className="field-label">
          Adresse e-mail
        </label>
        <input
          id="client-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={160}
          placeholder="prenom@exemple.com"
          aria-invalid={emailError ? "true" : undefined}
          aria-describedby={emailError ? "erreur-client-email" : undefined}
          className="input"
        />
        {emailError ? (
          <p id="erreur-client-email" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
            {emailError}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="client-password" className="field-label">
          Mot de passe
        </label>
        <input
          id="client-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Votre mot de passe"
          aria-invalid={passwordError ? "true" : undefined}
          aria-describedby={passwordError ? "erreur-client-password" : undefined}
          className="input"
        />
        {passwordError ? (
          <p id="erreur-client-password" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
            {passwordError}
          </p>
        ) : null}
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
            Connexion en cours…
          </>
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  );
}
