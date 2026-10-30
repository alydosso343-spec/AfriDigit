/**
 * Session administrateur signée (HMAC-SHA256), en 100 % Web Crypto :
 * la signature du jeton qui fait foi — le module fonctionne dans tout le
 * runtime (Edge du proxy inclus), sans dépendance à Node (`crypto` builtin,
 * `Buffer`…).
 *
 * Format du jeton :  base64url(payload JSON) + "." + base64url(signature)
 * Le payload contient uniquement l'adresse autorisée, une date
 * d'expiration et une version — rien de sensible (pas de mot de passe).
 */

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

/** Nom du cookie qui porte la session administrateur. */
export const SESSION_COOKIE = "afridigit_admin";

/** Durée de la session : 7 jours. */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

type AdminSessionPayload = {
  /** Adresse admin autorisée au moment de la connexion. */
  e: string;
  /** Expiration en millisecondes (epoch). */
  x: number;
  /** Version du format, pour d'éventuelles migrations futures. */
  v: 1;
};

/** Convertit des octets en base64url (sans `+`, `/` ni `=`). */
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Convertit une chaîne base64url en octets. */
function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    ENCODER.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Comparaison à temps constant : le temps de réponse ne révèle pas
 * la longueur ni le contenu du code d'accès.
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let difference = 0;
  for (let index = 0; index < a.length; index++) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

/** Fabrique un jeton de session signé pour l'adresse donnée. */
export async function createAdminSessionToken(
  secret: string,
  email: string,
  nowMs: number = Date.now()
): Promise<string> {
  const payload: AdminSessionPayload = {
    e: email.toLowerCase(),
    x: nowMs + SESSION_TTL_SECONDS * 1000,
    v: 1,
  };
  const encodedPayload = bytesToBase64Url(ENCODER.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    ENCODER.encode(encodedPayload)
  );
  return encodedPayload + "." + bytesToBase64Url(new Uint8Array(signature));
}

/**
 * Vérifie un jeton : signature valide ET non expirée.
 * @returns l'adresse stockée dans le jeton, ou `null` si quelconque doute.
 */
export async function verifyAdminSessionToken(
  secret: string,
  token: string | undefined
): Promise<string | null> {
  if (!token || token.length > 512) {
    return null;
  }
  const [encodedPayload, ...rest] = token.split(".");
  if (!encodedPayload || rest.length !== 1 || !rest[0]) {
    return null;
  }
  const signatureSegment = rest[0];

  try {
    const isValid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      base64UrlToBytes(signatureSegment),
      ENCODER.encode(encodedPayload)
    );
    if (!isValid) {
      return null;
    }

    const payload = JSON.parse(
      DECODER.decode(base64UrlToBytes(encodedPayload))
    ) as AdminSessionPayload;

    if (
      payload?.v !== 1 ||
      typeof payload?.e !== "string" ||
      typeof payload?.x !== "number" ||
      !Number.isFinite(payload.x)
    ) {
      return null;
    }
    if (payload.x <= Date.now()) {
      return null;
    }
    return payload.e.toLowerCase();
  } catch {
    // Payload illisible, base64url invalide, secret modifié…
    return null;
  }
}
