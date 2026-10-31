"use server";

import { redirect } from "next/navigation";
import {
  signInSchema,
  signUpSchema,
  zodToFieldErrors,
} from "@/lib/validation";
import { getOptionalSupabaseAuth } from "@/lib/supabase/auth-server";

/**
 * Server Actions de L'ESPACE CLIENT (visiteurs) :
 * inscription, connexion, déconnexion — toutes portées par Supabase Auth.
 * Aucun mot de passe n'est stocké ici : il est haché par Supabase.
 */

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const INITIAL_AUTH_STATE: AuthActionState = { status: "idle" };

/** Création d'un compte client (prénom, e-mail, mot de passe). */
export async function signUpCustomer(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: zodToFieldErrors(parsed.error) };
  }

  const supabase = getOptionalSupabaseAuth();
  if (!supabase) {
    return {
      status: "error",
      message: "L'espace client sera disponible à la mise en production du site.",
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { name: parsed.data.name } },
    });

    if (error) {
      const raw = error.message.toLowerCase();
      if (raw.includes("already registered") || raw.includes("user already")) {
        return {
          status: "error",
          message: "Un compte existe déjà avec cette adresse : connectez-vous.",
        };
      }
      return {
        status: "error",
        message: "La création du compte a échoué. Réessayez dans un instant.",
      };
    }

    // Compte auto-confirmé : la session est déjà posée → l'espace client.
    if (data.session) {
      redirect("/compte");
    }
    // Sinon : un e-mail de confirmation vient d'être envoyé.
    redirect("/compte/connexion?inscrit=1");
  } catch (exception) {
    if (isRedirect(exception)) {
      throw exception;
    }
    console.error("[AfriDigit] Inscription client impossible :", exception);
    return {
      status: "error",
      message: "La création du compte a échoué. Réessayez dans un instant.",
    };
  }
}

/** Connexion d'un client existant (e-mail + mot de passe). */
export async function signInCustomer(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: zodToFieldErrors(parsed.error) };
  }

  const supabase = getOptionalSupabaseAuth();
  if (!supabase) {
    return {
      status: "error",
      message: "L'espace client sera disponible à la mise en production du site.",
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      const raw = error.message.toLowerCase();
      if (raw.includes("email not confirmed") || raw.includes("not confirmed")) {
        return {
          status: "error",
          message:
            "Confirmez votre adresse via le lien reçu par e-mail, puis réessayez.",
        };
      }
      // Message unique : impossible de savoir si l'e-mail ou le mot de passe
      // a échoué (ni si le compte existe) — discrétion de rigueur.
      return { status: "error", message: "E-mail ou mot de passe incorrect." };
    }

    if (!data.session) {
      return { status: "error", message: "Connexion impossible. Réessayez." };
    }

    redirect("/compte");
  } catch (exception) {
    if (isRedirect(exception)) {
      throw exception;
    }
    console.error("[AfriDigit] Connexion client impossible :", exception);
    return { status: "error", message: "Connexion impossible. Réessayez." };
  }
}

/**
 * Déconnecte le CLIENT (espace visiteur) : supprime les cookies Supabase
 * puis ramène à l'accueil. Ne touche pas à la session administration.
 */
export async function signOutCustomer(): Promise<void> {
  const { createCookieSupabaseClient } = await import("@/lib/supabase/auth-server");
  const supabase = createCookieSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}

/**
 * Redirections internes de Next : elles traversent useActionState sous
 * forme d'exception à retransmettre (comportement documenté).
 */
function isRedirect(exception: unknown): boolean {
  return (
    typeof exception === "object" &&
    exception !== null &&
    "digest" in exception &&
    typeof (exception as { digest?: unknown }).digest === "string" &&
    (exception as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

