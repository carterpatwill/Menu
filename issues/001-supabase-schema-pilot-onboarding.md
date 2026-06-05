## Parent PRD

`issues/prd.md`

## What to build

Create the Supabase project, run all table migrations, apply RLS policies, configure auth and storage, and manually onboard the pilot restaurant. This is the foundational slice — every other slice depends on it.

See the Database Schema and Row Level Security sections of the PRD for the exact shape.

## Acceptance criteria

- [ ] Supabase project created; URL and anon key added to `.env.local` (and `.env.example` with placeholder values committed)
- [x] `@supabase/supabase-js` and `@supabase/ssr` installed
- [ ] All 5 tables exist: `restaurants`, `menu_items`, `nfc_tags`, `click_events`, `reviews`
- [ ] `category` enum (`specials | appetizers | mains | sides | drinks | desserts`) exists and is used on `menu_items`
- [ ] `event_type` enum (`menu_open | item_tap`) exists and is used on `click_events`
- [ ] RLS enabled on all tables; anon role can SELECT `restaurants` and `menu_items`, INSERT `click_events` and `reviews`
- [ ] Authenticated owner role has full CRUD on their own rows only (`auth.uid() = owner_id`)
- [ ] Supabase Storage bucket `menu-images` created; public read, authenticated write
- [ ] Auth configured for magic link (email) — no password login
- [ ] Pilot restaurant row inserted in `restaurants`; owner account created via Supabase Auth invite
- [ ] At least one `nfc_tags` row inserted for the pilot; NFC tag URL format documented

## Progress notes (2026-06-04)

AFK work done:
- Installed `@supabase/supabase-js` and `@supabase/ssr`
- Created `.env.example` with placeholder values
- Created `supabase/migrations/001_initial_schema.sql` — all 5 tables, 2 enums, full RLS policies
- Created `src/lib/supabase/types.ts` — typed `Database` type for supabase-js generics
- Created `src/lib/supabase/client.ts` — browser client factory
- Created `src/lib/supabase/server.ts` — async server client factory (uses Next.js `cookies()`)
- Wrote type-level tests in `src/lib/supabase/__tests__/types.test.ts`

Remaining HITL (needs Supabase credentials from user):
- Create Supabase project; add URL + anon key to `.env.local`
- Run `supabase db push` (or paste migration SQL in Supabase SQL editor)
- Create `menu-images` storage bucket (public read, authenticated write)
- Enable magic link auth (disable email+password in Auth settings)
- Invite pilot restaurant owner via Supabase Auth; insert `restaurants` and `nfc_tags` rows

## Blocked by

None — can start immediately.

## User stories addressed

Foundational — unlocks all 22 user stories. No direct story maps to this slice.
