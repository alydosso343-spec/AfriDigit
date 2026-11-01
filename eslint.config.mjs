import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Site en français : les apostrophes typographiques se vivent très bien
      // en JSX (réactivité JSX s'occupe de l'échappement), règle désactivée
      // pour garder des textes lisibles dans le code.
      "react/no-unescaped-entities": "off",
      // Les images de vignettes proviennent de Supabase Storage (ou d'URL
      // https externes saisies par l'administratrice) : <img> évite de devoir
      // lister les hôtes dans remotePatterns tout en gardant lazy loading.
      "@next/next/no-img-element": "off",
    },
  },
  {
    ignores: [".next/", "node_modules/", "out/", "coverage/", "next-env.d.ts", ".netlify/"],
  },
];

export default eslintConfig;
