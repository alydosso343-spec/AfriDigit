import Image from "next/image";

/**
 * Marque AfriDigit — le logo OFFICIEL fourni, utilisé tel quel :
 *  - public/logo.png        fichier d'origine (1024×1024, fond clair) ;
 *  - public/logo-lockup.png ensemble complet recadré (900×370) : carte +
 *    mot-symbole, utilisé dans l'en-tête et le pied de page ;
 *  - public/logo-mark.png   pictogramme seul recadré (350×350) : carte +
 *    étoile jaune, utilisé dans l'espace admin ;
 *  - app/icon.png           favicon généré à partir du pictogramme.
 */

/** Ensemble complet (carte + « AfriDigit »), hauteur libre, largeur auto. */
export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <Image
      src="/logo-lockup.png"
      alt="AfriDigit"
      width={900}
      height={370}
      priority
      className={`${className} w-auto rounded-lg`}
    />
  );
}

/** Pictogramme seul (carte d'Afrique + étoile), carré. */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      aria-hidden="true"
      width={350}
      height={350}
      className={`${className} shrink-0 rounded-lg`}
    />
  );
}
