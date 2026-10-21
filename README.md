# FLAT / Nuntam Kailawn Website

Next.js App Router website for Full Life Access Trust (FLAT), built from the supplied organisation profile and website architecture blueprint.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build for production

```bash
npm run build
npm start
```

## Important before launch
- Verify all impact figures and add their reporting periods.
- Add approved annual reports, profile PDFs and public resources.
- Approve the Privacy Policy and Terms of Use drafts.
- Add the official safeguarding reporting contact and response route.
- Verify office details, opening hours, email, phone, partner logos and all social links.
- Donation methods and tax-registration information must be published only after verification.

The website currently uses static content; a CMS, newsletter service, donation gateway and working enquiry form need to be connected separately before being advertised as live features.

## Supabase CMS and admin panel

The `/admin` route provides email/password sign-in and a content dashboard for Stories, News, Reports and Resources. Published Stories/News appear on `/stories`; published Reports/Resources appear on `/reports`.

### 1. Create a Supabase project

1. Create/open a project in Supabase.
2. In Project Settings → API, copy the Project URL and anon/public key.
3. Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Do not put the Supabase service-role key in the frontend or in any `NEXT_PUBLIC_` variable.

### 2. Create the CMS tables

1. Open Supabase → SQL Editor.
2. Run the complete `supabase/schema.sql` file.
3. In Authentication → Users, create the admin user with email/password.
4. Copy that user's UUID and run this in SQL Editor (replace the placeholder):

```sql
insert into public.site_admins (user_id)
values ('PASTE-AUTH-USER-UUID-HERE');
```

Only UUIDs in `site_admins` can open the verified admin dashboard and create, edit, publish or delete CMS entries. The dashboard calls the `is_site_admin()` database function after sign-in; a valid Supabase login without an approved UID is signed out and denied access. Database RLS independently blocks unauthorized writes even if someone bypasses the UI. Do not expose project owner credentials or the service-role key.

If the CMS schema already exists, run `supabase/admin_uid_security.sql` in the Supabase SQL Editor to re-apply the UID allowlist function and content RLS policies. The migration is intended to be rerunnable. Approve an admin by inserting their exact Authentication user UUID into `site_admins`; remove that row to revoke access. Never add a user based only on a self-registered email or a client-side check.

### 3. Run the website

```bash
npm install
npm run dev
```

Open `http://localhost:3000/admin`, sign in with the admin user and add content. Restart `npm run dev` after changing `.env.local`.

### Current CMS scope

- Email/password sign-in using Supabase Auth.
- Create, edit, publish/unpublish and delete Stories, News, Reports and Resources.
- Public pages show only published entries.
- Report/resource entries can include a file URL. Upload the file to a trusted storage location first; the CMS currently stores a URL rather than uploading files itself.
- `newsletter_subscribers` table is prepared in SQL, but the public newsletter signup form and subscriber management screen still need to be implemented before collecting subscriptions.
- Contact/volunteer forms and donation processing are not connected by this CMS scaffold.

Before deployment, configure the same environment variables in Vercel, run `npm run build`, and test sign-in, RLS, publish/unpublish and public pages.

### Admin UID security verification

1. Sign in with an approved UID listed in `site_admins`; the dashboard should open.
2. Sign in with a test account whose UUID is not in `site_admins`; it must show an access-denied message and sign out.
3. Confirm that the non-admin cannot insert/update/delete `site_content`; Supabase RLS must reject the requests.
4. Confirm public visitors can read only `published = true` rows.
5. Revoke a test admin by deleting its `site_admins` row and confirm the next admin verification denies access.
