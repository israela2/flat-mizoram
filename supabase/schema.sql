-- FLAT website CMS schema for Supabase
-- Run this in Supabase Dashboard > SQL Editor.
-- Public visitors can read published content. Only user IDs listed in site_admins can manage content.

create extension if not exists pgcrypto;

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  body text,
  content_type text not null check (content_type in ('story', 'news', 'report', 'resource')),
  image_url text,
  file_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.site_admins enable row level security;
revoke all on public.site_admins from anon, authenticated;

create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.site_admins where user_id = auth.uid()); $$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

create index if not exists site_content_type_published_idx
  on public.site_content (content_type, published, published_at desc);

create or replace function public.set_site_content_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at before update on public.site_content
for each row execute function public.set_site_content_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "Public can read published content" on public.site_content;
create policy "Public can read published content"
on public.site_content for select to anon, authenticated
using (published = true or public.is_site_admin());

drop policy if exists "Admins can insert site content" on public.site_content;
create policy "Admins can insert site content"
on public.site_content for insert to authenticated
with check (public.is_site_admin());

drop policy if exists "Admins can update site content" on public.site_content;
create policy "Admins can update site content"
on public.site_content for update to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());

drop policy if exists "Admins can delete site content" on public.site_content;
create policy "Admins can delete site content"
on public.site_content for delete to authenticated
using (public.is_site_admin());

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

-- After creating the admin account in Supabase Authentication > Users, copy its UUID and run:
-- insert into public.site_admins (user_id) values ('PASTE-AUTH-USER-UUID-HERE');
-- Manage the site_admins table only through the SQL editor as the project owner.

-- Optional newsletter table. A signup form should validate input and insert only email.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "Visitors can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Visitors can subscribe to newsletter"
on public.newsletter_subscribers for insert to anon, authenticated
with check (consent = true and length(email) <= 320);
-- Do not grant public select/update/delete on newsletter subscriber data.
grant insert on public.newsletter_subscribers to anon, authenticated;
