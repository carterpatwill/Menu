# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run typecheck    # Type-check without emitting
npm run gen-types    # Regenerate src/lib/supabase/types.ts from live DB schema (run after any schema change)
```

Run a single test file:
```bash
npx vitest run src/lib/__tests__/analytics-service.test.ts
```

## Architecture

Tappi is an NFC-based restaurant menu platform. Physical NFC tags link to `/r/[nfcId]` — a themed, public menu page. Restaurants manage their menu and view engagement analytics through a protected `/admin/*` dashboard.

### Routing

- `/r/[nfcId]` — Public menu page. Scanned from NFC. Supports `?preview=1` to bypass live-only checks.
- `/admin/*` — Protected by proxy (`src/proxy.ts`), which redirects unauthenticated requests to `/admin/login`.
- `/admin/auth/callback` — Supabase OAuth exchange; exempt from middleware guard.

### Data layer

All persistence is Supabase (Postgres). Two clients:
- `src/lib/supabase/server.ts` — SSR client using `@supabase/ssr`, reads cookies. Used in server components, server actions, and middleware.
- `src/lib/supabase/client.ts` — Browser client. Used only in client components.

Service modules in `src/lib/` encapsulate all DB access (never query Supabase directly in components). Key services: `menu-item-service`, `nfc-tag-service`, `restaurant-service`, `review-service`, `analytics-service`, `nfc-resolver`.

Generated DB types live in `src/lib/supabase/types.ts`.

### Theming

Public menu pages render through one of three themes: `WarmTheme`, `MinimalTheme`, `BoldTheme`. The `<MenuTheme>` component in `src/themes/index.tsx` is the single entry point — it selects the right theme based on `restaurantData.theme`. Always use `<MenuTheme>` when rendering `/r/[nfcId]` content; never import individual theme components directly from pages.

Theme data types live in `src/themes/types.ts` and are separate from raw DB types. `src/lib/menu-renderer.ts` converts DB rows into the theme data shape.

### Analytics

Two-part system:
- `src/lib/analytics-tracker.ts` — Client-side tracker. Fires `menu_open` on page load and `item_tap` on interaction, debounced to 2 seconds per item. Writes to `click_events` table.
- `src/lib/analytics-service.ts` — Server-side aggregation. Queries `click_events` and computes KPI tiles, daily trends, day-of-week × time-of-day heatmap, and top items.

### Auth

Google OAuth through Supabase Auth. Session stored in HTTP-only cookies managed by `@supabase/ssr`. The proxy (`src/proxy.ts`) is the auth gate — it calls `supabase.auth.getUser()` and redirects on failure.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM_ADDRESS
```

### Key data flows

**NFC scan → menu render:**
1. Customer scans tag → browser hits `/r/[nfcId]`
2. Server component calls `resolveTag(nfcId, supabase)` (`nfc-resolver.ts`) — fetches tag, restaurant, and items in sequence
3. Server component inserts a `menu_open` event into `click_events` (skipped if `?preview=1`)
4. `toThemeRestaurant(restaurant, items)` (`menu-renderer.ts`) converts DB rows to theme-safe types, including the restaurant's chosen `theme` and `tagline`
5. `<MenuClient>` (client boundary) receives the theme data and renders `<MenuTheme>`, which routes to `WarmTheme`, `MinimalTheme`, or `BoldTheme`
6. `createAnalyticsTracker()` is instantiated in `MenuClient` and fires debounced `item_tap` events on interaction

**Admin mutation (e.g. saving a menu item):**
1. Client component calls a server action from `src/app/admin/menu/actions.ts`
2. Action creates a cookie-scoped Supabase client and calls `getRestaurantId()` — this is the ownership/auth check
3. Action delegates to the relevant service function (`menu-item-service`, `restaurant-service`, etc.), passing the client
4. Action calls `revalidatePath()` to bust the Next.js cache so the page re-fetches on next load

### Database schema

There is no local Supabase instance. All schema changes must be applied manually in the **Supabase dashboard SQL editor**, then types regenerated:

```bash
npm run gen-types
```

Migration files live in `supabase/migrations/` as a record — they are not pushed automatically. When you write a schema change, save it there with the next numbered filename (e.g. `003_*.sql`).

**Tables:**

| Table | Purpose |
|---|---|
| `restaurants` | One row per owner. Holds name, slug, theme, tagline, and `has_*` category flags |
| `menu_items` | Menu entries. Linked to restaurant. Has category, price, featured/available flags, sort_order |
| `nfc_tags` | Physical NFC tags. Each tag belongs to a restaurant and has an optional label |
| `click_events` | Event log. Records `menu_open` (page load) and `item_tap` (interaction) with restaurant/tag/item context |
| `reviews` | Customer reviews. Rating 1–5 + body text, linked to restaurant and tag |

**RLS summary:** `anon` can read `restaurants`, `menu_items`, and `nfc_tags`, and insert into `click_events` and `reviews`. Authenticated owners have full CRUD on their own restaurant's data. Storage uploads use the service role key (bypasses RLS).

### Testing

Tests are in `src/lib/__tests__/` and `src/themes/__tests__/`. They use Vitest + jsdom + Testing Library. Supabase is mocked via a chainable query builder mock — see existing tests for the pattern before writing new ones.
