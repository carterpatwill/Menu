# PRD: Tappi — NFC-Powered Restaurant Menu Platform

## Problem Statement

Restaurant owners have no visibility into what menu items customers are actually interested in, or when that interest peaks. Traditional menus (paper or PDF) generate zero data. Owners make pricing, stocking, and promotion decisions blind. Meanwhile, customers scanning a QR code or NFC tag are handed an experience that doesn't guide them toward high-margin items or make ordering feel effortless on a phone screen.

## Solution

Tappi is a mobile-first restaurant menu web app triggered by NFC tags placed on tables. When a customer taps a tag, their phone opens a beautifully designed, phone-optimized menu for that restaurant. Every item view and tap is silently tracked with a timestamp. The restaurant owner logs into a private admin dashboard to manage their menu, pin featured items, label NFC tags, and view analytics. After browsing, customers can submit a review directly from the menu page.

## User Stories

### Customer (Menu Viewer)

1. As a customer, I want the menu to load instantly when I tap the NFC tag on my table, so that I don't have to wait or navigate anywhere.
2. As a customer, I want the menu to be designed for my phone screen, so that I can browse comfortably without pinching or zooming.
3. As a customer, I want to see featured items prominently at the top, so that I can quickly discover what the restaurant recommends.
4. As a customer, I want menu items organized into clear categories (Specials, Appetizers, Mains, Sides, Drinks, Desserts), so that I can find what I'm looking for quickly.
5. As a customer, I want to see a photo, name, price, and description for each menu item, so that I can make an informed choice.
6. As a customer, I want to tap a menu item to see more detail, so that I can learn more before deciding.
7. As a customer, I want to submit a review at the bottom of the menu page, so that I can share my experience without downloading an app.
8. As a customer, I want the menu to feel visually polished and appetizing, so that it enhances my dining experience.
9. As a customer, I want the menu to only show categories the restaurant actually has, so that I'm not confused by empty sections.

### Restaurant Owner (Admin)

10. As a restaurant owner, I want to log into a private dashboard using a magic link sent to my email, so that I don't have to remember a password.
11. As a restaurant owner, I want to add, edit, and remove menu items from my dashboard, so that my menu stays up to date.
12. As a restaurant owner, I want to upload a photo for each menu item, so that my menu looks professional without needing to host images myself.
13. As a restaurant owner, I want to toggle categories (Specials, Appetizers, Mains, Sides, Drinks, Desserts) on or off, so that my menu only shows sections relevant to my restaurant.
14. As a restaurant owner, I want to pin items as "featured" so that they appear as hero cards at the top of the menu and guide customers toward high-margin dishes.
15. As a restaurant owner, I want to mark items as unavailable without deleting them, so that I can temporarily hide sold-out items and restore them later.
16. As a restaurant owner, I want to manage my NFC tags and assign a label to each one (e.g. "Table 4", "Bar", "Patio"), so that I can identify where traffic is coming from in my analytics.
17. As a restaurant owner, I want to see how many times my menu was opened each day, so that I can understand foot traffic trends.
18. As a restaurant owner, I want to see which menu items were tapped most, so that I know what customers are most interested in.
19. As a restaurant owner, I want to see a breakdown of menu opens and item taps by time of day, so that I can understand peak interest windows.
20. As a restaurant owner, I want to read customer reviews submitted through my menu, so that I can act on feedback.
21. As a restaurant owner, I want to receive an email notification when a customer submits a review, so that I don't have to check the dashboard constantly.
22. As a restaurant owner, I want my menu to be linked to my NFC tags permanently, so that customers always reach the right menu when they tap.

## Implementation Decisions

### Stack
- **Frontend + API**: Next.js (App Router) with TypeScript, deployed on Vercel
- **Database, Auth, Storage**: Supabase (PostgreSQL + Row Level Security + Supabase Auth + Supabase Storage)
- **Email**: Resend (review notifications via a Supabase Edge Function or Next.js API route)
- **No separate backend service** — Supabase handles all data access, secured via RLS policies

### Database Schema

**`restaurants`**
- id, name, slug, owner_id (FK to auth.users), has_specials, has_appetizers, has_mains, has_sides, has_drinks, has_desserts

**`menu_items`**
- id, restaurant_id, name, description, price, category (enum: specials | appetizers | mains | sides | drinks | desserts), image_url, is_featured, is_available, sort_order

**`nfc_tags`**
- id, restaurant_id, label, created_at

**`click_events`**
- id, restaurant_id, nfc_tag_id, event_type (enum: menu_open | item_tap), menu_item_id (nullable — null for menu_open), created_at

**`reviews`**
- id, restaurant_id, nfc_tag_id, body, rating (1–5), created_at

### Row Level Security
- Anonymous users: SELECT on menu_items and restaurants (filtered by restaurant_id), INSERT on click_events and reviews
- Authenticated owners: full CRUD on their own restaurant's rows only, keyed to `auth.uid() = owner_id`

### URL Structure
- `/r/[nfcId]` — public menu page; resolves nfcId → restaurant, logs `menu_open` event
- `/admin` — protected admin dashboard (redirects to magic link login if unauthenticated)
- `/admin/menu` — menu item management
- `/admin/tags` — NFC tag management
- `/admin/analytics` — analytics dashboard
- `/admin/reviews` — review inbox

### Modules

**NFC Resolver**
Accepts an `nfcId`, looks up the corresponding restaurant and tag label, fires a `menu_open` event. Simple interface: `resolveTag(nfcId) → { restaurant, tagLabel }`. Testable in isolation against a mock Supabase client.

**Menu Renderer**
Accepts a restaurant + its menu items, groups by category (respecting enabled toggles), surfaces featured items as hero cards at top. Pure rendering logic — no data fetching. Testable with static fixture data.

**Analytics Tracker**
Client-side module that fires `item_tap` events on item interaction. Debounced to prevent duplicate events. Interface: `trackEvent(type, payload)`. Decoupled from the UI so it can be tested without rendering.

**Image Upload**
Wraps Supabase Storage upload for menu item photos. Handles file validation (type, size), returns a public URL on success. Testable independently of the rest of the admin UI.

**Review Submission**
Validates and inserts a review row, then triggers an email notification to the restaurant owner via Resend. Interface: `submitReview(payload) → success | error`. The email step is a side effect, testable via a mock email client.

**Admin Auth Guard**
Next.js middleware that protects `/admin` routes. Redirects to magic link login if no valid session. No business logic — thin wrapper over Supabase Auth session check.

### Testing Decisions

Good tests verify external behavior — what a module returns or what side effects it produces — not how it's implemented internally. Tests should not assert on internal state, specific function calls, or implementation details that could change without breaking the feature.

**Modules to test:**
- **NFC Resolver** — given a valid nfcId, returns correct restaurant and tag data; given an unknown id, returns a not-found result
- **Menu Renderer** — given menu items and category toggles, renders correct sections; featured items appear before others; unavailable items are hidden
- **Analytics Tracker** — fires the correct event payload on item tap; does not fire duplicates within the debounce window
- **Review Submission** — valid review inserts a row and triggers email; invalid review (missing body, out-of-range rating) returns a validation error without inserting

No prior test art exists in the codebase yet. Use Vitest for unit/integration tests and Playwright for end-to-end tests of the customer menu flow and admin login.

## Out of Scope

- Google Reviews integration (deferred)
- Public restaurant signup / self-serve onboarding (pilot restaurant is manually onboarded)
- Customer accounts or order history
- Online ordering or payment processing
- Multi-language support
- Custom category names (fixed set only)
- Automated/algorithmic upsell ranking (owner manually pins featured items)
- Native mobile app

## Further Notes

- NFC tags encode a permanent URL (`[domain]/r/[nfcId]`). The domain is not finalized — use the Vercel preview URL during the pilot to avoid reprinting tags if the domain changes.
- The pilot is a single restaurant, manually onboarded by the developer (Supabase account created directly, no public signup flow needed yet).
- Category toggles are boolean flags on the `restaurants` row — simpler than a join table and sufficient for a fixed category set.
- `item_tap` events reference `menu_item_id` so analytics can show per-item popularity even if the item is later renamed or removed.
