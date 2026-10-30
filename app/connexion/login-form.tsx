"use client";

import { useActionState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { signInAdmin, type LoginState } from "@/app/actions";

const INITIAL_STATE: LoginState = { status: "idle" };

/**
 * Formulaire de connexion générique. La Server Action `signInAdmin`
 * vérifie l'adresse et le code intégralement côté serveur, avec un
 * message d'erreur unique (aucune indication sur ce qui a échoué).
 */
export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAdmin, INITIAL_STATE);
  const emailError = state.fieldErrors?.email;
  const codeError = state.fieldErrors?.code;

  return (
    <form action={formAction} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="field-label">
          Adresse e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          placeholder="prenom@exemple.com"
          aria-invalid={emailError ? "true" : undefined}
          aria-describedby={emailError ? "erreur-email" : undefined}
          className="input"
        />
        {emailError ? (
          <p id="erreur-email" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
            {emailError}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="code" className="field-label">
          Code d&apos;accès
        </label>
        <input
          id="code"
          name="code"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          aria-invalid={codeError ? "true" : undefined}
          aria-describedby={codeError ? "erreur-code" : undefined}
          className="input"
        />
        {codeError ? (
          <p id="erreur-code" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
            {codeError}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
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
          <>
            <LogIn size={17} aria-hidden />
            Se connecter
          </>
        )}
      </button>
    </form>
  );
}
