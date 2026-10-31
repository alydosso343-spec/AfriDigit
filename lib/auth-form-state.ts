/**
 * État partagé des formulaires d'authentification client.
 * Ce module n'est ni client ni serveur : il n'est PAS marqué "use server",
 * car Next n'y autorise que des exports de fonctions async.
 */
export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const INITIAL_AUTH_STATE: AuthActionState = { status: "idle" };
