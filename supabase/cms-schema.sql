-- FLAT Mizoram CMS schema
-- Run in Supabase SQL Editor. Create an Auth user first, then add that user's UUID
-- to public.admin_users using the final INSERT statement below.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('project','gallery','news','event')),
  title text not null,
  title_mz text,
  description text,
  description_mz text,
  image_url text,
  caption text,
  item_date date,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_published_sort_idx
on public.content_items (published, kind, sort_order, created_at desc);

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.content_items enable row level security;

drop policy if exists "Admins can read admin roster" on public.admin_users;
create policy "Admins can read admin roster" on public.admin_users
for select to authenticated using (user_id = auth.uid());

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings
for select to anon, authenticated using (true);

drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings
for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Public can read published content" on public.content_items;
create policy "Public can read published content" on public.content_items
for select to anon, authenticated using (published = true);

drop policy if exists "Admins read all content" on public.content_items;
create policy "Admins read all content" on public.content_items
for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins insert content" on public.content_items;
create policy "Admins insert content" on public.content_items
for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins update content" on public.content_items;
create policy "Admins update content" on public.content_items
for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins delete content" on public.content_items;
create policy "Admins delete content" on public.content_items
for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Storage: create a PUBLIC bucket named "media" if it does not exist.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Public can view media" on storage.objects;
create policy "Public can view media" on storage.objects
for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "Admins upload media" on storage.objects;
create policy "Admins upload media" on storage.objects
for insert to authenticated
with check (bucket_id = 'media' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins update media" on storage.objects;
create policy "Admins update media" on storage.objects
for update to authenticated
using (bucket_id = 'media' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (bucket_id = 'media' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins delete media" on storage.objects;
create policy "Admins delete media" on storage.objects
for delete to authenticated
using (bucket_id = 'media' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- IMPORTANT: replace the UUID below with your real Supabase Auth user UUID.
-- INSERT INTO public.admin_users (user_id) VALUES ('YOUR-AUTH-USER-UUID') ON CONFLICT DO NOTHING;
