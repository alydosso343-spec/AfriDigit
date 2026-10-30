-- ============================================================================
-- AfriDigit — Migration de la base de données
-- À exécuter dans Supabase : Dashboard → SQL Editor → New query
-- (coller tout le fichier, puis « Run »). Idempotente : peut être relancée.
--
-- Modèle d'autorisation (v2) :
--   • CLÉ ANON (publique)      → lecture seule des produits + des images.
--   • CLÉ SERVICE_ROLE         → toutes les écritures (création, modification,
--     suppression, réorganisation produits, téléversement d'images).
-- Le site n'utilise la clé service_role QUE côté serveur, derrière une
-- session d'administration signée (adresse + code d'accès vérifiés).
-- Aucune règle RLS d'écriture n'est donc nécessaire pour les rôles
-- anon/authenticated : ils n'écrivent jamais, par conception.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Nettoyage de l'ancien modèle (sécurité si une ancienne migration a tourné)
-- ----------------------------------------------------------------------------
drop policy if exists "afridigit: gestion réservée à l'admin"
  on public.products;
drop policy if exists "afridigit: téléversement admin"
  on storage.objects;
drop policy if exists "afridigit: modification admin des images"
  on storage.objects;
drop policy if exists "afridigit: suppression admin des images"
  on storage.objects;
drop function if exists public.afridigit_is_admin();
drop table if exists public.app_admins;

-- ----------------------------------------------------------------------------
-- 1. Table des produits
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  chariow_url text not null check (chariow_url ~ '^https://'),
  image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_length check (char_length(name) between 2 and 80),
  constraint products_description_length check (char_length(description) between 5 and 300)
);

create index if not exists products_position_idx
  on public.products (position, created_at);

-- ----------------------------------------------------------------------------
-- 2. Règles RLS de la table produits : lecture publique uniquement
-- ----------------------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "afridigit: lecture publique des produits"
  on public.products;
create policy "afridigit: lecture publique des produits"
  on public.products
  for select
  to anon, authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- 3. updated_at automatique
-- ----------------------------------------------------------------------------
create or replace function public.afridigit_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row
  execute function public.afridigit_touch_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Stockage des images (bucket public « product-images »)
--    Lecture publique ; les écritures passent par la clé service_role
--    (les requêtes service_role contournent RLS, aucune policy requise).
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "afridigit: lecture publique des images"
  on storage.objects;
create policy "afridigit: lecture publique des images"
  on storage.objects
  for select
  using (bucket_id = 'product-images');

-- ============================================================================
-- Vérification rapide (optionnel) :
--   select * from public.products order by position;
-- ============================================================================

-- IMPORTANT :
--   • Copiez SUPABASE_SERVICE_ROLE_KEY (Project Settings → API, section
--     « service_role ») dans .env.local — c'est elle qui permet d'écrire.
--   • Ne partagez jamais cette clé et ne l'affichez jamais côté navigateur :
--     elle ne sort du serveur que pour écrire, derrière la session admin.
