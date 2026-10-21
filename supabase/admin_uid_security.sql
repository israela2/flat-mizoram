-- FLAT admin UID allowlist hardening migration
-- Run in Supabase SQL Editor as project owner.
-- Admins are explicitly approved by inserting their auth.users UUID into site_admins.

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.site_admins enable row level security;
revoke all on table public.site_admins from anon, authenticated;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.site_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_site_admin() from public;
revoke all on function public.is_site_admin() from anon;
grant execute on function public.is_site_admin() to authenticated;

-- Reassert database-level permissions: authenticated users may write content only
-- when their auth.uid() exists in site_admins. Public visitors can read published content.
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

-- To approve an administrator, first create the user under Authentication > Users,
-- then run the following with that exact UUID:
-- insert into public.site_admins (user_id) values ('PASTE-APPROVED-USER-UUID');
-- To revoke admin access:
-- delete from public.site_admins where user_id = 'PASTE-USER-UUID';
