## Parent PRD

`issues/prd.md`

## What to build

Magic link login flow and Next.js middleware that protects all `/admin` routes. Unauthenticated requests are redirected to the login page. Authenticated sessions are persisted via Supabase Auth cookies.

See the Admin Auth Guard module in the PRD.

## Acceptance criteria

- [ ] `/admin/login` page renders an email input; submitting sends a magic link via Supabase Auth
- [ ] Clicking the magic link in email establishes a session and redirects to `/admin`
- [ ] Next.js middleware redirects any unauthenticated request to `/admin/**` to `/admin/login`
- [ ] Authenticated users are not redirected (middleware passes through)
- [ ] Signing out clears the session and redirects to `/admin/login`
- [ ] No business logic in the middleware — thin wrapper over Supabase Auth session check

## Blocked by

- Blocked by `issues/001-supabase-schema-pilot-onboarding.md`

## User stories addressed

- User story 10 (magic link login, no password)
