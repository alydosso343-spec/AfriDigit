# AfriDigit

Boutique moderne, responsive et **multi-pages** en français pour vendre des produits digitaux (ebooks, formations, outils). Les visiteurs parcourent la vitrine (`/`, `/produits`, `/comment-ca-marche`) et achètent en un clic sur **Chariow** — le paiement n'est jamais réalisé sur le site lui-même. Une **administration protégée et discrète** permet de gérer les produits : elle est invisible du grand public (page de connexion générique `/connexion`, aucune mention d'admin, adresse et code jamais affichés).

---

## 1. Stack

| Choix | Rôle | Pourquoi |
|---|---|---|
| **Next.js 16** (App Router, TypeScript) | Framework du site | Vraies pages (routing natif), rendu serveur, Server Actions sécurisées, déploiement Vercel 1-clic |
| **Tailwind CSS v4** | Style | Vitesse, design system propre (jaune / blanc / bleu, effet verre, animations) |
| **Backend produits** | Persistance | **Local par défaut** (fichier JSON + images sur disque, zéro configuration) ; **Supabase** optionnel pour la production |
| **Zod** | Validation des formulaires | Schémas partagés client/serveur, messages d'erreur en français |
| **lucide-react** | Icônes | Légères, accessibles (`aria-hidden`) |

Deux backends interchangeables derrière une même façade (`lib/products.ts`) :

- **Mode local (défaut)** : produits dans `data/products.json`, images téléversées dans `public/uploads/` (servies publiquement). Le site fonctionne dès `npm run dev`, **sans aucun compte à créer**. Ces deux dossiers sont ignorés par git.
- **Mode Supabase (production)** : dès que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont définies, les lectures passent par la clé `anon` (lecture seule via RLS) et les écritures par la clé `service_role` (côté serveur uniquement). Basculer ne demande **aucun changement de code**.

---

## 2. Démarrage local (5 minutes, sans Supabase)

### a) Installer les dépendances

```bash
npm install
```

### b) Créer `.env.local` (ne part jamais dans git)

Le plus simple : copier `.env.example` puis compléter.

```bash
cp .env.example .env.local
```

| Variable | Obligatoire | Rôle |
|---|---|---|
| `ADMIN_EMAIL` | ✅ | adresse autorisée à se connecter sur `/connexion` |
| `ADMIN_ACCESS_CODE` | ✅ | code d'accès demandé à la connexion (n'existe **nulle part** dans le code) |
| `ADMIN_SESSION_SECRET` | ✅ | signature des cookies de session (générer : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `CURRENCY` | — | devise affichée (`XOF` → « F CFA ») |
| `NEXT_PUBLIC_SITE_URL` | — | URL publique en production |
| variables `SUPABASE_*` | — | **vides en local** : c'est le mode local qui sert les produits |

> Sans `ADMIN_EMAIL`, la connexion n'aboutit jamais (message unique « Identifiants incorrects. », sans aucune indication sur la cause).

### c) Lancer le site

```bash
npm run dev
```

- Accueil : <http://localhost:3000>
- Catalogue : <http://localhost:3000/produits>
- Comment ça marche : <http://localhost:3000/comment-ca-marche>
- Connexion (page générique) : <http://localhost:3000/connexion>

Les données locales vivent dans :

- `data/products.json` — le catalogue (créé au premier produit) ;
- `public/uploads/` — les images téléversées.

*Remise à zéro du backend local : supprimez ces deux éléments.*

### d) (Optionnel — production) Créer le projet Supabase

1. Créez un compte sur [supabase.com](https://supabase.com) puis **New project** (nom ex. `afridigit`, zone Europe de l'Ouest ou Europe).
2. Dans **SQL Editor → New query** : copiez tout le contenu de [`sql/migration.sql`](sql/migration.sql) puis **Run**. La table `products` apparaît (vide) ainsi que le bucket public `product-images`, avec les règles **RLS** déjà réglées (lecture publique, écritures réservées à la clé `service_role`).
3. Recopiez les 3 clés (URL, `anon`, `service_role`) dans `.env.local` **et redémarrez `npm run dev`** : le site bascule automatiquement sur Supabase. Pour revenir au mode local, videz ces 3 variables.

---

## 3. Utiliser l'administration (<http://localhost:3000/admin>)

- **Accès** : le bouton **« Connexion »** de l'en-tête (ou le pied de page) mène à `/connexion`, une page volontairement **générique** : titre « Connexion », pas de mention d'administration, adresse jamais affichée, non référencée par les moteurs de recherche. En cas d'erreur, un message unique « Identifiants incorrects. » ne révèle ni la cause ni l'existence de l'espace.
- **Session** : en cas de succès, un **cookie signé HTTP-only (HMAC), valide 7 jours** est posé ; « Connexion » devient « Espace admin ».
- **Créer** : bouton « Nouveau produit » → nom, prix, description courte, lien Chariow, image (fichier téléversé *ou* lien https). L'**aperçu en direct** montre la vignette exacte avant enregistrement.
- **Modifier** : icône crayon sur la ligne (l'image actuelle est conservée tant que le champ est intact).
- **Supprimer** : icône poubelle → confirmation explicite (l'image hébergée est nettoyée automatiquement).
- **Réorganiser** : flèches ↑ / ↓ sur chaque ligne ; l'ordre s'affiche identiquement sur la boutique.
- Le **prix** n'est qu'un affichage : la transaction se fait sur la page Chariow (le lien reste vérifiable via l'icône ouvrir).

---

## 4. Déploiement en production (Vercel)

1. Poussez le code sur GitHub, puis importez le dépôt dans [Vercel](https://vercel.com) (import projet → Next.js auto-détecté).
2. Dans **Settings → Environment Variables**, ajoutez toutes les variables de la section 2b **avec les valeurs de production** : nouveau code d'accès + nouveau secret, et les **3 clés Supabase**.
3. Côté Supabase : jouez `sql/migration.sql` sur le projet de production.
4. Redéploiez.

> ⚠️ **En production sur Vercel, le mode local n'est PAS adapté** : le système de fichiers d'une plateforme serverless n'est pas persistant (les fichiers écrits disparaissent). Configurez toujours Supabase pour un site en ligne ; le mode local reste parfait pour tester en local sur sa machine.

---

## 5. Sécurité : ce qui protège réellement l'espace privé

La protection est **en profondeur**, jamais en façade — et volontairement **invisible** côté public :

| Niveau | Où | Détail |
|---|---|---|
| Proxy (Edge) | `proxy.ts` | Chaque requête `/admin/*` sans session signée valide est renvoyée sur `/connexion` (les personnes connectées qui ouvrent `/connexion` sont renvoyées vers `/admin`). |
| Page (layout) | `app/admin/(dashboard)/layout.tsx` | `requireAdminSession()` revérifie la session à chaque rendu. |
| Actions serveur | `app/actions.ts` | Chaque écriture (créer/modifier/supprimer/réorganiser/téléverser) repasse par la même garde. |
| Limitation des tentatives | `app/actions.ts` | 5 connexions ratées / 10 min / adresse (en mémoire serveur). |
| Comparaison des identifiants | `lib/admin-session.ts` | À **temps constant** : le temps de réponse ne révèle ni la longueur ni le contenu du code. |
| Discrétion | `/connexion` | Page générique, `robots: noindex`, aucune adresse affichée, message d'erreur unique. |
| Secrets | `.env.local` | Clé `service_role` jamais dans le navigateur ; ne sort du serveur qu'après la garde de session. |

- Session = jeton signé `base64url(payload)`.`base64url(HMAC-SHA256)`, cookie **HTTP-only / SameSite=Lax / Secure en production**, 7 jours — impossible à forger depuis le navigateur.
- Backend indisponible ? La vitrine affiche ses états proprement (aucun bruit console) et les écritures sont refusées d'un mot, sans détail technique.

---

## 6. Personnalisation rapide

- **Devise** : variable `CURRENCY` (défaut `XOF`, affichée « F CFA »). Formats gérés par `lib/format.ts` (`Intl.NumberFormat('fr-FR')`).
- **Adresse / code admin** : variables `ADMIN_EMAIL` / `ADMIN_ACCESS_CODE` (aucune donnée codée en dur).
- **Logo** : composants `Logo` (bloc complet) et `LogoMark` (symbole seul) dans `components/logo.tsx`, à partir des images du dossier `public/` (`logo.png`, `logo-lockup.png`, `logo-mark.png`) et du favicon `app/icon.png`.
- **Couleurs / effet verre / animations** : `app/globals.css` (jetons, utilitaires `.glass`, `.btn-*`) ; animations respectant `prefers-reduced-motion`.
- **Textes du site** : directement dans `components/hero.tsx`, `components/how-it-works.tsx`, `app/(public)/*`.

---

## 7. États gérés par le site

- **Chargement** : squelettes de cartes animées (Suspense).
- **Aucun produit** : « Pas de formation disponible pour le moment. Soyez à l'affût — de nouvelles formations arrivent bientôt. »
- **Erreur de chargement** : carte d'erreur avec bouton « Réessayer » (détail technique visible seulement en développement).

---

## 8. Dépannage express

| Symptôme | Vérification |
|---|---|
| « Indisponible pour l'instant » sur `/connexion` | `ADMIN_ACCESS_CODE` ou `ADMIN_SESSION_SECRET` absents de `.env.local` (redémarrer `npm run dev` après ajout). |
| Connexion impossible malgré les bons identifiants | `ADMIN_EMAIL` manquant ou mal orthographié dans `.env.local`. |
| « Identifiants incorrects. » toujours affiché | Adresse ou code erroné — ou 5 tentatives déjà faites : patientez ~10 min (limitation automatique). |
| Produits non persistés après redémarrage (local) | En mode local les écritures vont dans `data/products.json` : ne le supprimez que pour réinitialiser. |
| Connexion OK mais écritures refusées (mode Supabase) | `SUPABASE_SERVICE_ROLE_KEY` (ou URL) absentes/mal recopiées — ou migration non jouée. |
| `new row violates row-level security policy` | La migration n'a pas été jouée, ou l'anonyme essaie d'écrire : vérifie `sql/migration.sql` et que les écritures passent par les Server Actions. |
| Téléversement refusé (Supabase) | Vérifier que la migration (bucket + policy lecture) a bien été exécutée. |
| Prix affiché sans devise correcte | `CURRENCY` mal orthographié (ex. `XOF`). |
| Session « perdue » tout le temps | `ADMIN_SESSION_SECRET` a changé (reconnectez-vous : seuls les cookies signés avec le bon secret passent). |

---

## 9. Arborescence notable

```
app/
  (public)/                → site public multi-pages
    layout.tsx             → en-tête + pied de page (session admin lue côté serveur)
    page.tsx               → accueil : héros + 3 produits phares + étapes
    produits/page.tsx      → catalogue complet
    comment-ca-marche/page.tsx → démarche détaillée
  actions.ts               → Server Actions (connexion, déconnexion, CRUD produits, images)
  connexion/
    page.tsx               → page de connexion générique et discrète (noindex)
    login-form.tsx         → formulaire client (useActionState)
  admin/(dashboard)/layout.tsx → garde serveur requireAdminSession + coquille admin
  admin/(dashboard)/page.tsx   → tableau de bord produits
components/
  site-header.tsx / hero.tsx / how-it-works.tsx / site-footer.tsx
  featured-products.tsx    → 3 produits phares de l'accueil
  product-card-view.tsx    → vignette partagée boutique + aperçu admin
  product-list.tsx         → grille publique (états chargement/vide/erreur)
  states.tsx / reveal.tsx  → squelettes, erreurs, apparitions au défilement
  admin/product-manager.tsx → liste, réorg., suppression, modales
  admin/product-form.tsx    → formulaire + aperçu en direct
lib/
  env.ts                   → lecture propre des variables d'environnement
  admin-session.ts         → jeton de session HMAC (Web Crypto, Edge-ready)
  admin-guard.ts           → cookies serveur + requireAdminSession
  format.ts, validation.ts, products.ts
  products.ts              → façade unique : choisit automatiquement le backend
  store/local-store.ts     → backend local (data/products.json + public/uploads)
  store/supabase-store.ts  → backend Supabase (anon lecture / service_role écritures)
  supabase/server.ts       → clients Supabase (anon + service_role)
sql/migration.sql          → migration Supabase à exécuter (option production)
proxy.ts                   → garde d'accès Edge (matcher /admin/* + /connexion)
.env.example               → modèle de variables à copier en .env.local
```

> Notes : la page de connexion vit sur sa propre route publique `/connexion`
> (générique et discrète), l'espace privé sous `/admin` dans le route group
> `(dashboard)`. Le site public vit dans `(public)` : ses pages sont de vraies
> URLs (`/`, `/produits`, `/comment-ca-marche`). Les dossiers `data/` et
> `public/uploads/` (backend local) sont ignorés par git.
